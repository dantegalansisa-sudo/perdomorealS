"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { saveSettings } from "@/app/admin/_actions/settings";
import type { I18nText, SiteSettings } from "@/lib/types";
import { Section } from "./ui";
import { Field, I18nField, NumberField, SaveBar, TextField, Toggle, type FieldErrors } from "./fields";
import { useToast } from "./Toast";

type Form = Omit<SiteSettings, "id">;
const SOCIALS = [
  ["instagram", "Instagram"],
  ["facebook", "Facebook"],
  ["youtube", "YouTube"],
  ["tiktok", "TikTok"],
  ["linkedin", "LinkedIn"],
] as const;

export function SettingsForm({ initial, projects }: { initial: Form; projects: { id: string; name: string }[] }) {
  const toast = useToast();
  const router = useRouter();
  const [form, setForm] = useState<Form>(initial);
  const [errors, setErrors] = useState<FieldErrors>();
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  function set<K extends keyof Form>(k: K, v: Form[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    setDirty(true);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await saveSettings({
      ...form,
      socials: {
        instagram: form.socials.instagram ?? "",
        facebook: form.socials.facebook ?? "",
        youtube: form.socials.youtube ?? "",
        tiktok: form.socials.tiktok ?? "",
        linkedin: form.socials.linkedin ?? "",
      },
    });
    setSaving(false);
    setErrors(res.ok ? undefined : res.fieldErrors);
    if (toast.result(res)) {
      setDirty(false);
      router.refresh();
    }
  }

  const waPreview = `https://wa.me/${form.whatsapp_number.replace(/\D/g, "")}?text=${encodeURIComponent(form.whatsapp_default_message.es)}`;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Section title="WhatsApp" description="Número en formato internacional, solo dígitos (ej. 18095550123).">
        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <TextField
            label="Número de WhatsApp"
            inputMode="numeric"
            value={form.whatsapp_number}
            onChange={(v) => set("whatsapp_number", v.replace(/\D/g, ""))}
            error={errors?.whatsapp_number}
          />
          <a href={waPreview} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm self-end">
            <MessageCircle className="size-4" /> Probar enlace
          </a>
        </div>
        <I18nField className="mt-4" label="Mensaje predeterminado" value={form.whatsapp_default_message} onChange={(v) => set("whatsapp_default_message", v)} multiline rows={2} />
        {projects.length > 0 && (
          <div className="mt-6 space-y-4">
            <p className="text-sm font-extrabold text-navy">Mensajes por proyecto</p>
            <p className="-mt-3 text-xs text-stone">Se usan en las páginas de cada proyecto. Vacío = mensaje predeterminado.</p>
            {projects.map((p) => (
              <I18nField
                key={p.id}
                label={p.name}
                value={form.whatsapp_project_messages[p.id] ?? { es: "", en: "" }}
                onChange={(v: I18nText) => set("whatsapp_project_messages", { ...form.whatsapp_project_messages, [p.id]: v })}
                multiline
                rows={2}
              />
            ))}
          </div>
        )}
      </Section>

      <Section title="Contacto">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="Email" type="email" value={form.email} onChange={(v) => set("email", v)} error={errors?.email} />
          <TextField label="Teléfono" value={form.phone} onChange={(v) => set("phone", v)} />
          <TextField label="Dirección" value={form.address} onChange={(v) => set("address", v)} className="md:col-span-2" />
        </div>
      </Section>

      <Section title="Redes sociales" description="URL completa de cada perfil. Deja vacío para ocultar.">
        <div className="grid gap-4 md:grid-cols-2">
          {SOCIALS.map(([k, label]) => (
            <TextField key={k} label={label} value={form.socials[k] ?? ""} onChange={(v) => set("socials", { ...form.socials, [k]: v })} placeholder="https://" />
          ))}
        </div>
      </Section>

      <Section title="Portada (hero)">
        <div className="space-y-4">
          <I18nField label="Título" value={form.hero.title} onChange={(v) => set("hero", { ...form.hero, title: v })} />
          <I18nField label="Subtítulo" value={form.hero.subtitle} onChange={(v) => set("hero", { ...form.hero, subtitle: v })} multiline rows={2} />
        </div>
      </Section>

      <Section title="Tasas de cambio" description="Para el selector de moneda del sitio.">
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField label="1 USD = DOP" value={form.exchange_rates.DOP} onChange={(v) => set("exchange_rates", { ...form.exchange_rates, DOP: v ?? 0 })} error={errors?.["exchange_rates.DOP"]} step="0.01" />
          <NumberField label="1 USD = EUR" value={form.exchange_rates.EUR} onChange={(v) => set("exchange_rates", { ...form.exchange_rates, EUR: v ?? 0 })} error={errors?.["exchange_rates.EUR"]} step="0.0001" />
        </div>
      </Section>

      <Section title="Analítica" description="Se cargan solo tras el consentimiento de cookies.">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Google Tag Manager ID" placeholder="GTM-XXXXXXX" value={form.gtm_id ?? ""} onChange={(v) => set("gtm_id", v || null)} error={errors?.gtm_id} />
          <TextField label="GA4 Measurement ID" placeholder="G-XXXXXXXXXX" value={form.ga4_id ?? ""} onChange={(v) => set("ga4_id", v || null)} error={errors?.ga4_id} />
        </div>
      </Section>

      <Section title="Contenido de ejemplo">
        <Field>
          <Toggle
            checked={form.show_placeholder_labels}
            onChange={(v) => set("show_placeholder_labels", v)}
            label="Mostrar etiquetas de información de ejemplo"
            description="Muestra un aviso en proyectos, propiedades y artículos marcados como “información de ejemplo”. Desactívalo cuando todo el contenido sea real."
          />
        </Field>
      </Section>

      <SaveBar saving={saving} dirty={dirty} label="Guardar ajustes" />
    </form>
  );
}
