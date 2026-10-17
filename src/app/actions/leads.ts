"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { z } from "zod";
import { hasServiceRole } from "@/lib/env";
import { createServiceClient } from "@/lib/supabase/service";
import { leadSchema, type LeadInput, type LeadResult } from "@/lib/lead-schema";
import { sendLeadNotification } from "@/lib/email";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const memoryHits = new Map<string, number[]>();

async function ipHash() {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "0.0.0.0";
  return createHash("sha256")
    .update(ip + (process.env.IP_HASH_SALT || "perdomo"))
    .digest("hex")
    .slice(0, 32);
}

async function rateLimited(hash: string, max = MAX_PER_WINDOW) {
  if (hasServiceRole) {
    const since = new Date(Date.now() - WINDOW_MS).toISOString();
    const { count } = await createServiceClient()
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", hash)
      .neq("type", "whatsapp_click")
      .gte("created_at", since);
    return (count ?? 0) >= max;
  }
  const now = Date.now();
  const hits = (memoryHits.get(hash) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  memoryHits.set(hash, hits);
  return hits.length > max;
}

async function verifyTurnstile(token: string | undefined) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // Turnstile is optional
  if (!token) return false;
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: new URLSearchParams({ secret, response: token }),
  });
  const data = (await res.json()) as { success: boolean };
  return data.success;
}

export async function submitLead(input: LeadInput): Promise<LeadResult> {
  // Honeypot: bots fill hidden fields. Pretend success so they don't retry.
  if (input.website) return { ok: true };

  const parsed = leadSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "validation", fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]> };
  }
  const data = parsed.data;

  if (!(await verifyTurnstile(data.turnstileToken))) return { ok: false, error: "captcha" };

  const hash = await ipHash();
  if (await rateLimited(hash)) return { ok: false, error: "rate_limit" };

  const row = {
    type: data.type,
    name: data.name,
    email: data.email,
    phone: data.phone,
    project_id: data.projectId || null,
    property_id: data.propertyId || null,
    interest: data.interest || null,
    budget: data.budget || null,
    message: data.message || null,
    locale: data.locale,
    visit_date: data.type === "visit" ? data.visitDate || null : null,
    visit_time: data.type === "visit" ? data.visitTime || null : null,
    visit_mode: data.type === "visit" ? data.visitMode || null : null,
    source_url: data.sourceUrl || null,
    utm: data.utm ?? null,
    ip_hash: hash,
  };

  if (hasServiceRole) {
    const { error } = await createServiceClient().from("leads").insert(row);
    if (error) {
      console.error("[leads] insert failed", error);
      return { ok: false, error: "server" };
    }
  } else {
    console.info("[leads] Supabase not configured — lead not persisted:", { ...row, ip_hash: undefined });
  }

  try {
    await sendLeadNotification(row);
  } catch (e) {
    console.error("[leads] email failed", e);
  }
  return { ok: true };
}

/** Records a WhatsApp click as a lightweight lead (no personal data). */
export async function logWhatsAppClick(input: { projectId?: string | null; propertyId?: string | null; locale: string; sourceUrl?: string }) {
  if (!hasServiceRole) return;
  const hash = await ipHash();
  const uuid = z.uuid();
  await createServiceClient()
    .from("leads")
    .insert({
      type: "whatsapp_click",
      project_id: input.projectId && uuid.safeParse(input.projectId).success ? input.projectId : null,
      property_id: input.propertyId && uuid.safeParse(input.propertyId).success ? input.propertyId : null,
      locale: input.locale === "en" ? "en" : "es",
      source_url: input.sourceUrl?.slice(0, 500) ?? null,
      ip_hash: hash,
    })
    .then(({ error }) => error && console.error("[leads] whatsapp log failed", error));
}
