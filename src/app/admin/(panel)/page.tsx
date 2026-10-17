import Link from "next/link";
import { ArrowRight, Building2, Home, Inbox, Sparkles } from "lucide-react";
import { requireStaff } from "@/lib/admin/auth";
import { Card, PageHeader } from "@/components/admin/ui";
import { LEAD_TYPES, UNIT_STATUS, UNIT_STATUS_COLOR } from "@/lib/admin/constants";
import type { LeadType, UnitStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const TZ = "America/Santo_Domingo";
const dayKey = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: TZ });

export default async function DashboardPage() {
  const { supabase } = await requireStaff();
  const since = new Date(Date.now() - 29 * 86400000);
  since.setUTCHours(0, 0, 0, 0);
  const sinceIso = since.toISOString();

  const [leads30, newLeads, activeProps, pubProjects, recent, projects, flagshipRes] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }).gte("created_at", sinceIso),
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("properties").select("id", { count: "exact", head: true }).eq("published", true),
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("published", true),
    supabase.from("leads").select("created_at,type,project_id").gte("created_at", sinceIso).order("created_at").limit(5000),
    supabase.from("projects").select("id,name"),
    supabase.from("projects").select("id,name,total_units").eq("is_flagship", true).order("sort").limit(1).maybeSingle(),
  ]);

  const rows = (recent.data ?? []) as { created_at: string; type: LeadType; project_id: string | null }[];
  const projectName = new Map(((projects.data ?? []) as { id: string; name: string }[]).map((p) => [p.id, p.name]));

  // Leads per day (last 30 days)
  const days: { key: string; label: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    days.push({ key: dayKey(d), label: d.toLocaleDateString("es-DO", { timeZone: TZ, day: "numeric", month: "short" }), count: 0 });
  }
  const byDay = new Map(days.map((d) => [d.key, d]));
  const byType: Record<LeadType, number> = { info: 0, price: 0, visit: 0, whatsapp_click: 0 };
  const byProject = new Map<string, number>();
  for (const r of rows) {
    const d = byDay.get(dayKey(new Date(r.created_at)));
    if (d) d.count++;
    if (r.type in byType) byType[r.type]++;
    const k = r.project_id ?? "none";
    byProject.set(k, (byProject.get(k) ?? 0) + 1);
  }
  const maxDay = Math.max(1, ...days.map((d) => d.count));
  const projectRanking = [...byProject.entries()]
    .map(([id, count]) => ({ id, name: id === "none" ? "Sin proyecto / general" : projectName.get(id) ?? "Proyecto eliminado", count }))
    .sort((a, b) => b.count - a.count);
  const maxProject = Math.max(1, ...projectRanking.map((p) => p.count));
  const totalType = Math.max(1, Object.values(byType).reduce((a, b) => a + b, 0));

  // Flagship units
  const flagship = flagshipRes.data as { id: string; name: string; total_units: number } | null;
  let units: { lot_number: number; code: string; status: UnitStatus }[] = [];
  if (flagship) {
    const { data } = await supabase.from("units").select("lot_number,code,status").eq("project_id", flagship.id).order("lot_number");
    units = (data ?? []) as typeof units;
  }
  const unitCounts: Record<UnitStatus, number> = { available: 0, reserved: 0, sold: 0 };
  units.forEach((u) => unitCounts[u.status]++);

  const kpis = [
    { label: "Leads (30 días)", value: leads30.count ?? 0, icon: Inbox, href: "/admin/leads" },
    { label: "Leads nuevos", value: newLeads.count ?? 0, icon: Sparkles, href: "/admin/leads?status=new", accent: true },
    { label: "Propiedades activas", value: activeProps.count ?? 0, icon: Home, href: "/admin/propiedades" },
    { label: "Proyectos publicados", value: pubProjects.count ?? 0, icon: Building2, href: "/admin/proyectos" },
  ];

  return (
    <>
      <PageHeader title="Dashboard" description="Resumen de actividad de los últimos 30 días." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <Link
            key={k.label}
            href={k.href}
            className={cn("card group p-4 transition-shadow hover:shadow-lg hover:shadow-navy/5 sm:p-5", k.accent && "border-gold bg-gold-soft/30")}
          >
            <div className="flex items-center justify-between">
              <k.icon className="size-5 text-gold-dark" />
              <ArrowRight className="size-4 text-stone-light transition-transform group-hover:translate-x-0.5" />
            </div>
            <p className="mt-4 font-display text-4xl text-navy">{k.value}</p>
            <p className="mt-1 text-xs font-bold text-stone">{k.label}</p>
          </Link>
        ))}
      </div>

      <Card className="mt-4">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-sans text-base font-extrabold normal-case tracking-normal">Leads por día</h2>
          <span className="text-xs text-stone">{rows.length} en 30 días</span>
        </div>
        <div className="flex h-44 items-end gap-[3px] sm:gap-1">
          {days.map((d) => (
            <div key={d.key} className="group relative flex h-full flex-1 flex-col justify-end">
              <div
                className={cn("w-full rounded-t-md transition-colors", d.count ? "bg-navy group-hover:bg-gold" : "bg-sand-3")}
                style={{ height: `${d.count ? Math.max(6, (d.count / maxDay) * 100) : 3}%` }}
              />
              <span className="pointer-events-none absolute -top-7 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-navy px-2 py-0.5 text-[10px] font-bold text-white group-hover:block">
                {d.label}: {d.count}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] font-semibold text-stone">
          <span>{days[0].label}</span>
          <span>{days[14].label}</span>
          <span>Hoy</span>
        </div>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-sans text-base font-extrabold normal-case tracking-normal">Leads por proyecto</h2>
          {projectRanking.length === 0 ? (
            <p className="text-sm text-stone">Aún no hay leads en este periodo.</p>
          ) : (
            <ul className="space-y-3">
              {projectRanking.slice(0, 8).map((p) => (
                <li key={p.id}>
                  <div className="mb-1 flex justify-between gap-2 text-sm">
                    <span className="truncate font-semibold text-navy">{p.name}</span>
                    <span className="font-bold text-navy">{p.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-sand-2">
                    <div className="h-full rounded-full bg-gold" style={{ width: `${(p.count / maxProject) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <h2 className="mb-4 font-sans text-base font-extrabold normal-case tracking-normal">Leads por tipo</h2>
          <div className="mb-4 flex h-3 overflow-hidden rounded-full bg-sand-2">
            {(Object.keys(byType) as LeadType[]).map((t, i) => (
              <div key={t} className={TYPE_COLORS[i]} style={{ width: `${(byType[t] / totalType) * 100}%` }} />
            ))}
          </div>
          <ul className="grid grid-cols-2 gap-3">
            {(Object.keys(byType) as LeadType[]).map((t, i) => (
              <li key={t} className="flex items-center gap-2 rounded-xl border border-line px-3 py-2">
                <span className={cn("size-2.5 rounded-full", TYPE_COLORS[i])} />
                <span className="flex-1 text-sm font-semibold text-navy-soft">{LEAD_TYPES[t]}</span>
                <span className="font-bold">{byType[t]}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mt-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-sans text-base font-extrabold normal-case tracking-normal">Disponibilidad {flagship ? `· ${flagship.name}` : ""}</h2>
            <p className="text-xs text-stone">Proyecto insignia (is_flagship)</p>
          </div>
          {flagship && (
            <Link href={`/admin/unidades?p=${flagship.id}`} className="btn btn-ghost btn-sm">
              Gestionar unidades <ArrowRight className="size-3.5" />
            </Link>
          )}
        </div>
        {!flagship ? (
          <p className="text-sm text-stone">No hay ningún proyecto marcado como insignia.</p>
        ) : units.length === 0 ? (
          <p className="text-sm text-stone">Este proyecto aún no tiene unidades. Créalas desde “Unidades”.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-[220px_1fr]">
            <ul className="space-y-2">
              {(Object.keys(unitCounts) as UnitStatus[]).map((s) => (
                <li key={s} className="flex items-center gap-3 rounded-xl border border-line px-3 py-2">
                  <span className={cn("size-3 rounded", UNIT_STATUS_COLOR[s])} />
                  <span className="flex-1 text-sm font-semibold">{UNIT_STATUS[s]}</span>
                  <span className="font-display text-2xl">{unitCounts[s]}</span>
                </li>
              ))}
              <li className="px-3 text-xs text-stone">Total: {units.length} unidades</li>
            </ul>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(22px,1fr))] content-start gap-1">
              {units.map((u) => (
                <div
                  key={u.lot_number}
                  title={`${u.code} · ${UNIT_STATUS[u.status]}`}
                  className={cn("grid aspect-square place-items-center rounded-[5px] text-[8px] font-bold text-white/90", UNIT_STATUS_COLOR[u.status])}
                >
                  {u.lot_number}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </>
  );
}

const TYPE_COLORS = ["bg-navy", "bg-gold", "bg-available", "bg-[#25D366]"];
