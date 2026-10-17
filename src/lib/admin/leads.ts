import "server-only";
import type { SessionClient } from "./auth";
import type { Lead, LeadStatus, LeadType } from "@/lib/types";
import { LEAD_STATUS, LEAD_TYPES } from "./constants";

export type LeadFilters = {
  status?: LeadStatus;
  type?: LeadType;
  project?: string;
  from?: string;
  to?: string;
  q?: string;
};

export type LeadRow = Lead & {
  project: { name: string } | null;
  property: { title: { es: string; en: string } } | null;
};

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;
const isDate = (v?: string) => !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);

export function parseLeadFilters(sp: Record<string, string | string[] | undefined>): LeadFilters {
  const status = one(sp.status);
  const type = one(sp.type);
  const project = one(sp.project);
  const from = one(sp.from);
  const to = one(sp.to);
  const q = one(sp.q)?.trim().slice(0, 100);
  return {
    status: status && status in LEAD_STATUS ? (status as LeadStatus) : undefined,
    type: type && type in LEAD_TYPES ? (type as LeadType) : undefined,
    project: project && (project === "none" || /^[0-9a-f-]{36}$/i.test(project)) ? project : undefined,
    from: isDate(from) ? from : undefined,
    to: isDate(to) ? to : undefined,
    q: q || undefined,
  };
}

export function leadFiltersToQuery(f: LeadFilters) {
  const p = new URLSearchParams();
  Object.entries(f).forEach(([k, v]) => {
    if (v) p.set(k, v);
  });
  return p.toString();
}

export async function queryLeads(supabase: SessionClient, f: LeadFilters, limit = 500) {
  let q = supabase
    .from("leads")
    .select("*, project:projects(name), property:properties(title)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (f.status) q = q.eq("status", f.status);
  if (f.type) q = q.eq("type", f.type);
  if (f.project === "none") q = q.is("project_id", null);
  else if (f.project) q = q.eq("project_id", f.project);
  if (f.from) q = q.gte("created_at", `${f.from}T00:00:00`);
  if (f.to) q = q.lte("created_at", `${f.to}T23:59:59.999`);
  if (f.q) {
    // Strip characters that have meaning in PostgREST filter syntax.
    const term = f.q.replace(/[%,()*\\:"]/g, " ").trim();
    if (term) {
      const like = `%${term}%`;
      q = q.or(`name.ilike.${like},email.ilike.${like},phone.ilike.${like},message.ilike.${like},interest.ilike.${like}`);
    }
  }
  const { data, error } = await q;
  return { rows: (data ?? []) as unknown as LeadRow[], error };
}
