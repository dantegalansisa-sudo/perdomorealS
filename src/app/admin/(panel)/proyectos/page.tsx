import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Plus, Star } from "lucide-react";
import { requireStaff } from "@/lib/admin/auth";
import { toggleProjectFlag } from "@/app/admin/_actions/projects";
import { CONSTRUCTION_STATUS } from "@/lib/admin/constants";
import { EmptyState, PageHeader, Pill, PlaceholderPill, TableWrap, td, th } from "@/components/admin/ui";
import { InlineToggle } from "@/components/admin/InlineActions";
import type { ConstructionStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Proyectos" };

type Row = {
  id: string;
  name: string;
  zone: string;
  status: ConstructionStatus;
  total_units: number;
  price_from: number | null;
  published: boolean;
  featured: boolean;
  is_flagship: boolean;
  is_placeholder: boolean;
  sort: number;
};

export default async function ProjectsPage() {
  const { supabase } = await requireStaff();
  const [{ data }, { data: covers }] = await Promise.all([
    supabase.from("projects").select("id,name,zone,status,total_units,price_from,published,featured,is_flagship,is_placeholder,sort").order("sort").order("created_at"),
    supabase.from("media").select("owner_id,url").eq("owner_type", "project").eq("is_cover", true),
  ]);
  const rows = (data ?? []) as Row[];
  const cover = new Map(((covers ?? []) as { owner_id: string; url: string }[]).map((c) => [c.owner_id, c.url]));

  return (
    <>
      <PageHeader
        title="Proyectos"
        description="Desarrollos inmobiliarios, sus modelos de villa, planes de pago y documentos."
        actions={
          <Link href="/admin/proyectos/nuevo" className="btn btn-gold btn-sm">
            <Plus className="size-4" /> Nuevo proyecto
          </Link>
        }
      />
      {rows.length === 0 ? (
        <EmptyState icon={<Building2 className="size-5" />} title="Aún no hay proyectos">
          Crea tu primer proyecto o ejecuta <code>npm run seed</code> para cargar el contenido de ejemplo.
        </EmptyState>
      ) : (
        <TableWrap>
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-line bg-sand/60">
              <tr>
                <th className={th}>Proyecto</th>
                <th className={th}>Estado</th>
                <th className={th}>Unidades</th>
                <th className={th}>Desde</th>
                <th className={th}>Publicado</th>
                <th className={th}>Destacado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((p) => (
                <tr key={p.id} className="hover:bg-sand/40">
                  <td className={td}>
                    <Link href={`/admin/proyectos/${p.id}`} className="flex items-center gap-3">
                      <span className="size-12 shrink-0 overflow-hidden rounded-xl bg-sand-2">
                        {cover.get(p.id) && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={cover.get(p.id)} alt="" className="size-full object-cover" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-2 font-bold text-navy hover:text-gold-dark">
                          {p.name}
                          {p.is_flagship && (
                            <Pill className="border-gold bg-gold-soft text-navy">
                              <Star className="size-3" /> Insignia
                            </Pill>
                          )}
                          {p.is_placeholder && <PlaceholderPill />}
                        </span>
                        <span className="text-xs text-stone">{p.zone || "—"}</span>
                      </span>
                    </Link>
                  </td>
                  <td className={td}>{CONSTRUCTION_STATUS[p.status]}</td>
                  <td className={td}>{p.total_units}</td>
                  <td className={td}>{p.price_from ? `US$${Number(p.price_from).toLocaleString("en-US")}` : "—"}</td>
                  <td className={td}>
                    <InlineToggle initial={p.published} action={toggleProjectFlag.bind(null, p.id, "published")} label="Publicado" />
                  </td>
                  <td className={td}>
                    <InlineToggle initial={p.featured} action={toggleProjectFlag.bind(null, p.id, "featured")} label="Destacado" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}
    </>
  );
}
