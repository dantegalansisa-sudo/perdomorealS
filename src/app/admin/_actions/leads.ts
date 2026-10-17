"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { actionContext } from "@/lib/admin/auth";
import { handleError } from "@/lib/admin/action";
import { dbMessage, fail, ok, zodFail, type ActionResult } from "@/lib/admin/result";
import { leadNoteSchema, leadStatus } from "@/lib/admin/schemas";
import { LEAD_STATUS } from "@/lib/admin/constants";
import type { LeadNote, LeadStatus } from "@/lib/types";

// Leads are private data: no public revalidation needed.

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<ActionResult> {
  try {
    const { supabase } = await actionContext();
    const parsed = z.object({ id: z.string().uuid(), status: leadStatus }).safeParse({ id, status });
    if (!parsed.success) return zodFail(parsed.error);
    const { error } = await supabase.from("leads").update({ status: parsed.data.status }).eq("id", parsed.data.id);
    if (error) return fail(dbMessage(error));
    return ok(undefined, `Estado: ${LEAD_STATUS[parsed.data.status]}`);
  } catch (e) {
    return handleError(e);
  }
}

export async function addLeadNote(leadId: string, body: string): Promise<ActionResult<LeadNote>> {
  try {
    const { supabase, email } = await actionContext();
    const parsed = leadNoteSchema.safeParse({ lead_id: leadId, body });
    if (!parsed.success) return zodFail(parsed.error);
    const { data, error } = await supabase
      .from("lead_notes")
      .insert({ ...parsed.data, author: email })
      .select("*")
      .single();
    if (error) return fail(dbMessage(error));
    return ok(data as LeadNote, "Nota añadida");
  } catch (e) {
    return handleError(e);
  }
}

export async function deleteLeadNote(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await actionContext();
    const { error } = await supabase.from("lead_notes").delete().eq("id", id);
    if (error) return fail(dbMessage(error));
    return ok(undefined, "Nota eliminada");
  } catch (e) {
    return handleError(e);
  }
}

/** Admin only (RLS also enforces it). */
export async function deleteLead(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await actionContext("admin");
    const { error, count } = await supabase.from("leads").delete({ count: "exact" }).eq("id", id);
    if (error) return fail(dbMessage(error));
    if (!count) return fail("No se pudo eliminar el lead (sin permisos).");
  } catch (e) {
    return handleError(e);
  }
  redirect("/admin/leads");
}
