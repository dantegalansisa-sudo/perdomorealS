import type { Metadata } from "next";
import Link from "next/link";
import { Download, Inbox, MessageCircle, Search } from "lucide-react";
import { requireStaff } from "@/lib/admin/auth";
import { leadFiltersToQuery, parseLeadFilters, queryLeads } from "@/lib/admin/leads";
import { LEAD_STATUS, LEAD_TYPES } from "@/lib/admin/constants";
import { EmptyState, PageHeader, Pill, TableWrap, td, th } from "@/components/admin/ui";
import { LeadStatusSelect } from "@/components/admin/LeadStatusSelect";
import type { LeadStatus, LeadType } from "@/lib/types";

export const metadata: Metadata = { title: "Leads" };

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("es-DO", { timeZone: "America/Santo_Domingo", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

export default async function LeadsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { supabase } = await requireStaff();
  const filters = parseLeadFilters(await searchParams);
  const [{ rows, error }, { data: projects }] = await Promise.all([
    queryLeads(supabase, filters),
    supabase.from("projects").select("id,name").order("sort"),
  ]);
  const qs = leadFiltersToQuery(filters);
  const hasFilters = qs.length > 0;

  return (
    <>
      <PageHeader
        title="Leads"
        description="Solicitudes de información, precios, visitas y clics de WhatsApp."
        actions={
          <a href={`/admin/leads/export${qs ? `?${qs}` : ""}`} className="btn btn-ghost btn-sm">
            <Download className="size-4" /> Exportar CSV
          </a>
        }
      />

      <form method="get" className="card mb-4 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-6">
        <div className="relative sm:col-span-2">
          <label className="label">Buscar</label>
          <Search className="pointer-events-none absolute bottom-3 left-3.5 size-4 text-stone" />
          <input name="q" defaultValue={filters.q} placeholder="Nombre, email, teléfono, mensaje…" className="field !py-2 pl-10" />
        </div>
        <div>
          <label className="label">Estado</label>
          <select name="status" defaultValue={filters.status ?? ""} className="field !py-2">
            <option value="">Todos</option>
            {(Object.keys(LEAD_STATUS) as LeadStatus[]).map((s) => (
              <option key={s} value={s}>
                {LEAD_STATUS[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Tipo</label>
          <select name="type" defaultValue={filters.type ?? ""} className="field !py-2">
            <option value="">Todos</option>
            {(Object.keys(LEAD_TYPES) as LeadType[]).map((t) => (
              <option key={t} value={t}>
                {LEAD_TYPES[t]}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="label">Proyecto</label>
          <select name="project" defaultValue={filters.project ?? ""} className="field !py-2">
            <option value="">Todos</option>
            <option value="none">Sin proyecto</option>
            {((projects ?? []) as { id: string; name: string }[]).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Desde</label>
          <input type="date" name="from" defaultValue={filters.from} className="field !py-2" />
        </div>
        <div>
          <label className="label">Hasta</label>
          <input type="date" name="to" defaultValue={filters.to} className="field !py-2" />
        </div>
        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-4 lg:justify-end">
          {hasFilters && (
            <Link href="/admin/leads" className="btn btn-ghost btn-sm">
              Limpiar
            </Link>
          )}
          <button className="btn btn-navy btn-sm">Filtrar</button>
        </div>
      </form>

      {error ? (
        <p className="card p-4 text-sm text-red-600">No se pudieron cargar los leads: {error.message}</p>
      ) : rows.length === 0 ? (
        <EmptyState icon={<Inbox className="size-5" />} title={hasFilters ? "Ningún lead coincide con los filtros" : "Aún no hay leads"}>
          {hasFilters ? "Prueba con otros filtros." : "Los formularios del sitio aparecerán aquí."}
        </EmptyState>
      ) : (
        <>
          <TableWrap>
            <table className="w-full min-w-[900px] text-sm">
              <thead className="border-b border-line bg-sand/60">
                <tr>
                  <th className={th}>Fecha</th>
                  <th className={th}>Contacto</th>
                  <th className={th}>Tipo</th>
                  <th className={th}>Interés</th>
                  <th className={th}>Estado</th>
                  <th className={th} />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((l) => {
                  const phone = l.phone?.replace(/\D/g, "");
                  return (
                    <tr key={l.id} className={l.status === "new" ? "bg-gold-soft/20 hover:bg-gold-soft/40" : "hover:bg-sand/40"}>
                      <td className={`${td} whitespace-nowrap text-xs text-stone`}>{fmt(l.created_at)}</td>
                      <td className={td}>
                        <Link href={`/admin/leads/${l.id}`} className="block">
                          <span className="font-bold text-navy hover:text-gold-dark">{l.name || "Sin nombre"}</span>
                          <span className="block text-xs text-stone">{[l.email, l.phone].filter(Boolean).join(" · ") || "—"}</span>
                        </Link>
                      </td>
                      <td className={td}>
                        <Pill className="border-line bg-white text-navy-soft">{LEAD_TYPES[l.type]}</Pill>
                        {l.type === "visit" && l.visit_date && <span className="mt-1 block text-[11px] text-stone">{l.visit_date}</span>}
                      </td>
                      <td className={`${td} max-w-[240px]`}>
                        <span className="block truncate font-semibold">{l.project?.name ?? l.property?.title?.es ?? l.interest ?? "—"}</span>
                        {l.message && <span className="block truncate text-xs text-stone">{l.message}</span>}
                      </td>
                      <td className={td}>
                        <LeadStatusSelect id={l.id} initial={l.status} />
                      </td>
                      <td className={`${td} text-right`}>
                        <div className="flex justify-end gap-1">
                          {phone && (
                            <a
                              href={`https://wa.me/${phone}`}
                              target="_blank"
                              rel="noreferrer"
                              title="WhatsApp"
                              className="grid size-8 place-items-center rounded-full text-[#1da851] hover:bg-emerald-50"
                            >
                              <MessageCircle className="size-4" />
                            </a>
                          )}
                          <Link href={`/admin/leads/${l.id}`} className="btn btn-ghost btn-sm !px-3 !py-1.5">
                            Ver
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableWrap>
          <p className="mt-2 text-xs text-stone">
            {rows.length} lead{rows.length === 1 ? "" : "s"}
            {rows.length >= 500 ? " (mostrando los 500 más recientes; usa filtros o exporta a CSV)" : ""}
          </p>
        </>
      )}
    </>
  );
}
