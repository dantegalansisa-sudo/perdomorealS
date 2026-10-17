import type { Metadata } from "next";
import { requireStaff } from "@/lib/admin/auth";
import { PageHeader } from "@/components/admin/ui";
import { FaqManager } from "@/components/admin/FaqManager";
import type { Faq } from "@/lib/types";

export const metadata: Metadata = { title: "Preguntas frecuentes" };

export default async function FaqPage() {
  const { supabase } = await requireStaff();
  const [{ data }, { data: projects }] = await Promise.all([
    supabase.from("faqs").select("*").order("sort"),
    supabase.from("projects").select("id,name").order("sort"),
  ]);
  return (
    <>
      <PageHeader title="Preguntas frecuentes" description="Preguntas generales del sitio y específicas de cada proyecto. Ordénalas con las flechas." />
      <FaqManager initial={(data ?? []) as Faq[]} projects={(projects ?? []) as { id: string; name: string }[]} />
    </>
  );
}
