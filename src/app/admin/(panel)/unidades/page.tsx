import type { Metadata } from "next";
import Link from "next/link";
import { Grid3x3 } from "lucide-react";
import { requireStaff } from "@/lib/admin/auth";
import { EmptyState, PageHeader } from "@/components/admin/ui";
import { UnitsTable } from "@/components/admin/UnitsTable";
import { ProjectPicker } from "@/components/admin/ProjectPicker";
import type { Unit } from "@/lib/types";

export const metadata: Metadata = { title: "Unidades" };

type P = { id: string; name: string; is_flagship: boolean; total_units: number };

export default async function UnitsPage({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const { supabase } = await requireStaff();
  const { p } = await searchParams;
  const { data } = await supabase.from("projects").select("id,name,is_flagship,total_units").order("sort").order("created_at");
  const projects = (data ?? []) as P[];
  const project = projects.find((x) => x.id === p) ?? projects.find((x) => x.is_flagship) ?? projects[0];

  if (!project)
    return (
      <>
        <PageHeader title="Unidades" />
        <EmptyState icon={<Grid3x3 className="size-5" />} title="No hay proyectos">
          <Link href="/admin/proyectos/nuevo" className="font-bold text-gold-dark underline">
            Crea un proyecto
          </Link>{" "}
          para gestionar sus unidades.
        </EmptyState>
      </>
    );

  const [{ data: unitsData }, { data: modelsData }] = await Promise.all([
    supabase.from("units").select("*").eq("project_id", project.id).order("lot_number").limit(2000),
    supabase.from("villa_models").select("id,code,name").eq("project_id", project.id).order("sort"),
  ]);
  const units = (unitsData ?? []) as Unit[];

  return (
    <>
      <PageHeader
        title="Unidades"
        description="Disponibilidad de villas / lotes. Alimenta el masterplan interactivo y los contadores del sitio."
        actions={<ProjectPicker projects={projects.map((x) => ({ id: x.id, name: x.name + (x.is_flagship ? " ★" : "") }))} value={project.id} />}
      />
      <UnitsTable
        key={`${project.id}-${units.length}`}
        projectId={project.id}
        totalUnits={project.total_units}
        initialUnits={units}
        models={(modelsData ?? []) as { id: string; code: string; name: string }[]}
      />
    </>
  );
}
