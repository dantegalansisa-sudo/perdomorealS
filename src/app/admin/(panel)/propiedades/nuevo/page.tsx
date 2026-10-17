import type { Metadata } from "next";
import { requireStaff } from "@/lib/admin/auth";
import { emptyProperty } from "@/lib/admin/defaults";
import { PageHeader } from "@/components/admin/ui";
import { PropertyForm } from "@/components/admin/PropertyForm";

export const metadata: Metadata = { title: "Nueva propiedad" };

export default async function NewPropertyPage() {
  const { supabase } = await requireStaff();
  const { data } = await supabase.from("projects").select("id,name,zone").order("sort");
  return (
    <>
      <PageHeader title="Nueva propiedad" back={{ href: "/admin/propiedades", label: "Propiedades" }} description="Después de crearla podrás subir sus imágenes." />
      <PropertyForm id={null} initial={emptyProperty()} projects={(data ?? []) as { id: string; name: string; zone: string }[]} />
    </>
  );
}
