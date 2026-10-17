import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Grid3x3 } from "lucide-react";
import { requireStaff } from "@/lib/admin/auth";
import { projectToForm } from "@/lib/admin/defaults";
import { deleteProject } from "@/app/admin/_actions/projects";
import { PageHeader, PublishedPill, Section } from "@/components/admin/ui";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { VillaModelsEditor } from "@/components/admin/VillaModelsEditor";
import { MediaManager } from "@/components/admin/MediaManager";
import { ConfirmActionButton } from "@/components/admin/InlineActions";
import type { MediaItem, Project, VillaModel } from "@/lib/types";

export const metadata: Metadata = { title: "Editar proyecto" };

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await requireStaff();
  const { data } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const project = data as Project;

  const { data: modelsData } = await supabase.from("villa_models").select("*").eq("project_id", id).order("sort");
  const models = (modelsData ?? []) as VillaModel[];
  const { data: mediaData } = await supabase
    .from("media")
    .select("*")
    .in("owner_id", [id, ...models.map((m) => m.id)])
    .order("sort");
  const media = (mediaData ?? []) as MediaItem[];
  const modelsWithMedia = models.map((m) => ({ ...m, media: media.filter((x) => x.owner_type === "model" && x.owner_id === m.id) }));
  const projectMedia = media.filter((x) => x.owner_type === "project" && x.owner_id === id);

  return (
    <>
      <PageHeader
        title={project.name}
        back={{ href: "/admin/proyectos", label: "Proyectos" }}
        description={<PublishedPill published={project.published} />}
        actions={
          <>
            <Link href={`/admin/unidades?p=${id}`} className="btn btn-ghost btn-sm">
              <Grid3x3 className="size-4" /> Unidades
            </Link>
            <a href={`/es/proyectos/${project.slug_es}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
              <ExternalLink className="size-4" /> Ver
            </a>
          </>
        }
      />

      <div className="space-y-5">
        <Section title="Imágenes del proyecto" description="La primera marcada como portada se usa en tarjetas y redes sociales.">
          <MediaManager ownerType="project" ownerId={id} initialItems={projectMedia} allowFloorplan title="Galería" />
        </Section>

        <Section title="Modelos de villa" description="Tipologías del proyecto. Cada modelo tiene sus propias imágenes y planos.">
          <VillaModelsEditor projectId={id} models={modelsWithMedia} />
        </Section>

        <ProjectForm id={id} initial={projectToForm(project)} />

        <Section title="Zona de peligro" className="border-red-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-stone">Eliminar el proyecto borra también sus modelos, unidades, FAQs e imágenes.</p>
            <ConfirmActionButton
              action={deleteProject.bind(null, id)}
              confirmText={`¿Eliminar definitivamente “${project.name}”? Se borrarán sus modelos, unidades, FAQs e imágenes.`}
              label="Eliminar proyecto"
            />
          </div>
        </Section>
      </div>
    </>
  );
}
