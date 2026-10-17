import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { requireStaff } from "@/lib/admin/auth";
import { propertyToForm } from "@/lib/admin/defaults";
import { deleteProperty } from "@/app/admin/_actions/properties";
import { PageHeader, PublishedPill, Section } from "@/components/admin/ui";
import { PropertyForm } from "@/components/admin/PropertyForm";
import { MediaManager } from "@/components/admin/MediaManager";
import { ConfirmActionButton } from "@/components/admin/InlineActions";
import type { MediaItem, Property } from "@/lib/types";

export const metadata: Metadata = { title: "Editar propiedad" };

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await requireStaff();
  const [{ data }, { data: projects }, { data: media }] = await Promise.all([
    supabase.from("properties").select("*").eq("id", id).maybeSingle(),
    supabase.from("projects").select("id,name,zone").order("sort"),
    supabase.from("media").select("*").eq("owner_type", "property").eq("owner_id", id).order("sort"),
  ]);
  if (!data) notFound();
  const property = data as Property;
  const title = property.title?.es || property.title?.en || "Propiedad";

  return (
    <>
      <PageHeader
        title={title}
        back={{ href: "/admin/propiedades", label: "Propiedades" }}
        description={<PublishedPill published={property.published} />}
        actions={
          <a href={`/es/propiedades/${property.slug_es}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
            <ExternalLink className="size-4" /> Ver
          </a>
        }
      />
      <div className="space-y-5">
        <Section title="Imágenes" description="Arrastra para reordenar. La portada se usa en tarjetas y redes sociales.">
          <MediaManager ownerType="property" ownerId={id} initialItems={(media ?? []) as MediaItem[]} allowFloorplan title="Galería" />
        </Section>
        <PropertyForm id={id} initial={propertyToForm(property)} projects={(projects ?? []) as { id: string; name: string; zone: string }[]} />
        <Section title="Zona de peligro" className="border-red-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-stone">Se eliminará la propiedad y todas sus imágenes.</p>
            <ConfirmActionButton action={deleteProperty.bind(null, id)} confirmText={`¿Eliminar definitivamente “${title}”?`} label="Eliminar propiedad" />
          </div>
        </Section>
      </div>
    </>
  );
}
