"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { togglePropertyFlag } from "@/app/admin/_actions/properties";
import { CONSTRUCTION_STATUS, PROPERTY_TYPES } from "@/lib/admin/constants";
import type { ConstructionStatus, I18nText, PropertyType } from "@/lib/types";
import { InlineToggle } from "./InlineActions";
import { PlaceholderPill } from "./ui";

export type PropertyRow = {
  id: string;
  title: I18nText;
  type: PropertyType;
  zone: string;
  price: number | null;
  status: ConstructionStatus;
  bedrooms: number;
  featured: boolean;
  published: boolean;
  is_placeholder: boolean;
  project_name: string | null;
  cover: string | null;
};

export function PropertiesList({ rows }: { rows: PropertyRow[] }) {
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [zone, setZone] = useState("");
  const [pub, setPub] = useState("");
  const zones = useMemo(() => [...new Set(rows.map((r) => r.zone).filter(Boolean))].sort(), [rows]);

  const filtered = rows.filter((r) => {
    const text = `${r.title.es} ${r.title.en} ${r.zone} ${r.project_name ?? ""}`.toLowerCase();
    return (
      (!q || text.includes(q.toLowerCase())) &&
      (!type || r.type === type) &&
      (!zone || r.zone === zone) &&
      (!pub || (pub === "yes" ? r.published : !r.published))
    );
  });

  return (
    <div className="space-y-4">
      <div className="card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone" />
          <input className="field !py-2 pl-10" placeholder="Buscar por título, zona o proyecto" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="field !py-2" value={type} onChange={(e) => setType(e.target.value)} aria-label="Tipo">
          <option value="">Todos los tipos</option>
          {Object.entries(PROPERTY_TYPES).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <select className="field !py-2" value={zone} onChange={(e) => setZone(e.target.value)} aria-label="Zona">
          <option value="">Todas las zonas</option>
          {zones.map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </select>
        <select className="field !py-2" value={pub} onChange={(e) => setPub(e.target.value)} aria-label="Publicación">
          <option value="">Publicadas y borradores</option>
          <option value="yes">Solo publicadas</option>
          <option value="no">Solo borradores</option>
        </select>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="border-b border-line bg-sand/60">
              <tr className="text-left text-[11px] font-extrabold uppercase tracking-wider text-stone">
                <th className="px-4 py-3">Propiedad</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Destacar en home</th>
                <th className="px-4 py-3">Publicada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-sand/40">
                  <td className="px-4 py-3">
                    <Link href={`/admin/propiedades/${r.id}`} className="flex items-center gap-3">
                      <span className="size-12 shrink-0 overflow-hidden rounded-xl bg-sand-2">
                        {r.cover && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={r.cover} alt="" className="size-full object-cover" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-2 font-bold text-navy hover:text-gold-dark">
                          <span className="max-w-[280px] truncate">{r.title.es || r.title.en || "Sin título"}</span>
                          {r.is_placeholder && <PlaceholderPill />}
                        </span>
                        <span className="block text-xs text-stone">
                          {[r.zone, r.project_name].filter(Boolean).join(" · ") || "—"}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {PROPERTY_TYPES[r.type]}
                    {r.bedrooms ? <span className="text-stone"> · {r.bedrooms} hab</span> : null}
                  </td>
                  <td className="px-4 py-3 font-semibold">{r.price ? `US$${Number(r.price).toLocaleString("en-US")}` : "—"}</td>
                  <td className="px-4 py-3">{CONSTRUCTION_STATUS[r.status]}</td>
                  <td className="px-4 py-3">
                    <InlineToggle initial={r.featured} action={(v) => togglePropertyFlag(r.id, "featured", v)} label="Destacar en home" />
                  </td>
                  <td className="px-4 py-3">
                    <InlineToggle initial={r.published} action={(v) => togglePropertyFlag(r.id, "published", v)} label="Publicada" />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-stone">
                    No hay propiedades que coincidan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs text-stone">
        {filtered.length} de {rows.length} propiedades
      </p>
    </div>
  );
}
