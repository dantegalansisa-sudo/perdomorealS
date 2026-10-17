import type { Metadata } from "next";
import Link from "next/link";
import { Home, Plus } from "lucide-react";
import { requireStaff } from "@/lib/admin/auth";
import { EmptyState, PageHeader } from "@/components/admin/ui";
import { PropertiesList, type PropertyRow } from "@/components/admin/PropertiesList";

export const metadata: Metadata = { title: "Propiedades" };

export default async function PropertiesPage() {
  const { supabase } = await requireStaff();
  const [{ data }, { data: covers }] = await Promise.all([
    supabase
      .from("properties")
      .select("id,title,type,zone,price,status,bedrooms,featured,published,is_placeholder,project:projects(name)")
      .order("created_at", { ascending: false }),
    supabase.from("media").select("owner_id,url").eq("owner_type", "property").eq("is_cover", true),
  ]);
  const cover = new Map(((covers ?? []) as { owner_id: string; url: string }[]).map((c) => [c.owner_id, c.url]));
  const rows: PropertyRow[] = ((data ?? []) as unknown as (Omit<PropertyRow, "project_name" | "cover"> & { project: { name: string } | null })[]).map(
    ({ project, ...r }) => ({ ...r, project_name: project?.name ?? null, cover: cover.get(r.id) ?? null })
  );

  return (
    <>
      <PageHeader
        title="Propiedades"
        description="Villas, apartamentos, casas y terrenos del catálogo."
        actions={
          <Link href="/admin/propiedades/nuevo" className="btn btn-gold btn-sm">
            <Plus className="size-4" /> Nueva propiedad
          </Link>
        }
      />
      {rows.length === 0 ? (
        <EmptyState icon={<Home className="size-5" />} title="Aún no hay propiedades">
          Crea la primera propiedad del catálogo.
        </EmptyState>
      ) : (
        <PropertiesList rows={rows} />
      )}
    </>
  );
}
