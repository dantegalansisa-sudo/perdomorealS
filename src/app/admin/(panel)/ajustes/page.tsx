import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { PageHeader } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/SettingsForm";
import type { SiteSettings } from "@/lib/types";

export const metadata: Metadata = { title: "Ajustes" };

const e = () => ({ es: "", en: "" });

export default async function SettingsPage() {
  const { supabase } = await requireAdmin();
  const [{ data }, { data: projects }] = await Promise.all([
    supabase.from("settings").select("*").eq("id", 1).maybeSingle(),
    supabase.from("projects").select("id,name").order("sort"),
  ]);
  const s = (data ?? {}) as Partial<SiteSettings>;
  const initial: Omit<SiteSettings, "id"> = {
    whatsapp_number: s.whatsapp_number ?? "",
    whatsapp_default_message: { ...e(), ...(s.whatsapp_default_message ?? {}) },
    whatsapp_project_messages: s.whatsapp_project_messages ?? {},
    email: s.email ?? "",
    phone: s.phone ?? "",
    address: s.address ?? "",
    socials: s.socials ?? {},
    hero: { title: { ...e(), ...(s.hero?.title ?? {}) }, subtitle: { ...e(), ...(s.hero?.subtitle ?? {}) } },
    exchange_rates: { DOP: Number(s.exchange_rates?.DOP ?? 60), EUR: Number(s.exchange_rates?.EUR ?? 0.92) },
    gtm_id: s.gtm_id ?? null,
    ga4_id: s.ga4_id ?? null,
    show_placeholder_labels: s.show_placeholder_labels ?? true,
  };
  return (
    <>
      <PageHeader title="Ajustes del sitio" description="Datos de contacto, WhatsApp, textos de portada, tasas de cambio y analítica." />
      <SettingsForm initial={initial} projects={(projects ?? []) as { id: string; name: string }[]} />
    </>
  );
}
