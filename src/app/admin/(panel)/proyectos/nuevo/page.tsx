import type { Metadata } from "next";
import { requireStaff } from "@/lib/admin/auth";
import { emptyProject } from "@/lib/admin/defaults";
import { PageHeader } from "@/components/admin/ui";
import { ProjectForm } from "@/components/admin/ProjectForm";

export const metadata: Metadata = { title: "Nuevo proyecto" };

export default async function NewProjectPage() {
  await requireStaff();
  return (
    <>
      <PageHeader
        title="Nuevo proyecto"
        back={{ href: "/admin/proyectos", label: "Proyectos" }}
        description="Después de crearlo podrás subir imágenes y añadir modelos de villa."
      />
      <ProjectForm id={null} initial={emptyProject()} />
    </>
  );
}
