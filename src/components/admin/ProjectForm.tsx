"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, MapPin } from "lucide-react";
import { saveProject } from "@/app/admin/_actions/projects";
import { CONSTRUCTION_STATUS, ZONE_SUGGESTIONS } from "@/lib/admin/constants";
import type { ProjectForm as ProjectFormState } from "@/lib/admin/defaults";
import type { ConstructionStatus, Distance, PaymentPlan, ProjectDocument, TimelineStep } from "@/lib/types";
import { cn, slugify } from "@/lib/utils";
import { Section } from "./ui";
import { AmenitiesPicker, Field, I18nField, NumberField, SaveBar, SelectField, SeoEditor, TextField, Toggle, type FieldErrors } from "./fields";
import { Repeater } from "./Repeater";
import { PdfUrlField } from "./FileUpload";
import { useToast } from "./Toast";

const NAV = [
  ["general", "General"],
  ["ubicacion", "Ubicación"],
  ["precios", "Estado y precios"],
  ["amenidades", "Amenidades"],
  ["cronograma", "Cronograma"],
  ["pagos", "Planes de pago"],
  ["documentos", "Documentos"],
  ["distancias", "Distancias"],
  ["desarrollador", "Desarrollador"],
  ["multimedia", "Video y tour"],
  ["seo", "SEO"],
  ["visibilidad", "Visibilidad"],
] as const;

export function ProjectForm({ id, initial }: { id: string | null; initial: ProjectFormState }) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState<ProjectFormState>(initial);
  const [errors, setErrors] = useState<FieldErrors>();
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!!id);

  function set<K extends keyof ProjectFormState>(key: K, value: ProjectFormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
  }

  async function onSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setSaving(true);
    setErrors(undefined);
    const res = await saveProject(id, form);
    setSaving(false);
    if (!res.ok) {
      setErrors(res.fieldErrors);
      toast.error(res.error);
      return;
    }
    toast.success(res.message ?? "Guardado");
    setDirty(false);
    if (!id && res.data) router.push(`/admin/proyectos/${res.data.id}`);
    else router.refresh();
  }

  const err = (k: string) => errors?.[k];
  const planSum = (p: PaymentPlan) => Number(p.down || 0) + Number(p.during || 0) + Number(p.delivery || 0);
  const folder = `documents/${id ?? "nuevo"}`;

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[180px_1fr]">
      <nav className="hidden lg:block">
        <ul className="sticky top-20 space-y-0.5 text-sm">
          {NAV.map(([href, label]) => (
            <li key={href}>
              <a href={`#${href}`} className="block rounded-lg px-3 py-1.5 font-semibold text-stone hover:bg-white hover:text-navy">
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="min-w-0 space-y-5">
        <Section id="general" title="Información general">
          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              label="Nombre del proyecto *"
              value={form.name}
              error={err("name")}
              onChange={(v) => {
                setForm((f) => ({ ...f, name: v, ...(!slugTouched ? { slug_es: slugify(v), slug_en: slugify(v) } : {}) }));
                setDirty(true);
              }}
            />
            <NumberField label="Orden" value={form.sort} onChange={(v) => set("sort", Math.round(v ?? 0))} step={1} hint="Menor número = aparece primero" />
          </div>
          <div className="mt-4 space-y-4">
            <I18nField label="Tagline" value={form.tagline} onChange={(v) => set("tagline", v)} />
            <I18nField label="Descripción" value={form.description} onChange={(v) => set("description", v)} multiline rows={6} />
          </div>
        </Section>

        <Section id="ubicacion" title="Ubicación">
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="Nombre de la ubicación" value={form.location_name} onChange={(v) => set("location_name", v)} placeholder="Macao, Punta Cana" />
            <Field label="Zona" hint="Se usa en filtros del sitio">
              <input className="field" list="zones" value={form.zone} onChange={(e) => set("zone", e.target.value)} />
              <datalist id="zones">
                {ZONE_SUGGESTIONS.map((z) => (
                  <option key={z} value={z} />
                ))}
              </datalist>
            </Field>
            <NumberField label="Latitud" value={form.lat} onChange={(v) => set("lat", v ?? 0)} error={err("lat")} step="0.000001" />
            <NumberField label="Longitud" value={form.lng} onChange={(v) => set("lng", v ?? 0)} error={err("lng")} step="0.000001" />
          </div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${form.lat},${form.lng}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-gold-dark hover:underline"
          >
            <MapPin className="size-3.5" /> Abrir en Google Maps <ExternalLink className="size-3" />
          </a>
        </Section>

        <Section id="precios" title="Estado y precios">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SelectField
              label="Estado"
              value={form.status}
              onChange={(v) => set("status", v as ConstructionStatus)}
              options={Object.entries(CONSTRUCTION_STATUS).map(([value, label]) => ({ value: value as ConstructionStatus, label }))}
            />
            <NumberField label="Precio desde (USD)" value={form.price_from} onChange={(v) => set("price_from", v)} nullable error={err("price_from")} />
            <Field label="Fecha de entrega" error={err("delivery_date")}>
              <input type="date" className="field" value={form.delivery_date ?? ""} onChange={(e) => set("delivery_date", e.target.value || null)} />
            </Field>
            <NumberField label="Total de unidades" value={form.total_units} onChange={(v) => set("total_units", Math.round(v ?? 0))} step={1} min={0} />
          </div>
        </Section>

        <Section id="amenidades" title="Amenidades">
          <AmenitiesPicker value={form.amenities} onChange={(v) => set("amenities", v)} />
        </Section>

        <Section id="cronograma" title="Cronograma de obra" description="Fases con fecha y porcentaje de avance.">
          <Repeater<TimelineStep>
            items={form.timeline}
            onChange={(v) => set("timeline", v)}
            newItem={() => ({ phase: { es: "", en: "" }, date: "", progress: 0 })}
            addLabel="Añadir fase"
            render={(s, update, i) => (
              <div className="space-y-3">
                <I18nField label={`Fase ${i + 1}`} value={s.phase} onChange={(phase) => update({ phase })} error={err(`timeline.${i}.phase.es`)} />
                <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
                  <TextField label="Fecha" value={s.date} onChange={(date) => update({ date })} placeholder="2026-Q4 o 2026-10" />
                  <Field label={`Progreso: ${s.progress}%`} error={err(`timeline.${i}.progress`)}>
                    <div className="flex items-center gap-3 pt-3">
                      <input type="range" min={0} max={100} step={5} className="range" value={s.progress} onChange={(e) => update({ progress: Number(e.target.value) })} />
                      <input
                        type="number"
                        min={0}
                        max={100}
                        className="field w-20 !py-2"
                        value={s.progress}
                        onChange={(e) => update({ progress: Math.max(0, Math.min(100, Number(e.target.value))) })}
                      />
                    </div>
                  </Field>
                </div>
              </div>
            )}
          />
        </Section>

        <Section id="pagos" title="Planes de pago" description="Los porcentajes de cada plan (inicial + construcción + entrega) deben sumar 100%.">
          <Repeater<PaymentPlan>
            items={form.payment_plans}
            onChange={(v) => set("payment_plans", v)}
            newItem={() => ({ id: `plan-${form.payment_plans.length + 1}`, name: { es: "", en: "" }, down: 30, during: 40, delivery: 30, installments: 12 })}
            addLabel="Añadir plan"
            render={(p, update, i) => {
              const sum = planSum(p);
              return (
                <div className="space-y-3">
                  <div className="grid gap-3 md:grid-cols-[180px_1fr]">
                    <TextField label="ID" value={p.id} onChange={(v) => update({ id: slugify(v) || v })} error={err(`payment_plans.${i}.id`)} className="font-mono" />
                    <I18nField label="Nombre del plan" value={p.name} onChange={(name) => update({ name })} error={err(`payment_plans.${i}.name.es`)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <NumberField label="Inicial" suffix="%" value={p.down} onChange={(v) => update({ down: v ?? 0 })} />
                    <NumberField label="Construcción" suffix="%" value={p.during} onChange={(v) => update({ during: v ?? 0 })} />
                    <NumberField label="Entrega" suffix="%" value={p.delivery} onChange={(v) => update({ delivery: v ?? 0 })} />
                    <NumberField label="Cuotas" value={p.installments} onChange={(v) => update({ installments: Math.round(v ?? 0) })} step={1} min={0} />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-sand-3">
                      <div className="bg-navy" style={{ width: `${Math.min(100, p.down)}%` }} />
                      <div className="bg-gold" style={{ width: `${Math.min(100, p.during)}%` }} />
                      <div className="bg-available" style={{ width: `${Math.min(100, p.delivery)}%` }} />
                    </div>
                    <span className={cn("text-xs font-extrabold", sum === 100 ? "text-available" : "text-red-600")}>
                      {sum}% {sum === 100 ? "✓" : "· debe sumar 100%"}
                    </span>
                  </div>
                </div>
              );
            }}
          />
        </Section>

        <Section id="documentos" title="Documentos" description="Lista de precios, especificaciones, contratos… Sube el PDF o pega una URL.">
          <Repeater<ProjectDocument>
            items={form.documents}
            onChange={(v) => set("documents", v)}
            newItem={() => ({ name: { es: "", en: "" }, url: "" })}
            addLabel="Añadir documento"
            render={(d, update, i) => (
              <div className="space-y-3">
                <I18nField label="Nombre del documento" value={d.name} onChange={(name) => update({ name })} error={err(`documents.${i}.name.es`)} />
                <Field label="Archivo">
                  <PdfUrlField value={d.url} onChange={(url) => update({ url })} folder={folder} />
                </Field>
              </div>
            )}
          />
        </Section>

        <Section id="distancias" title="Distancias" description="Puntos de interés cercanos.">
          <Repeater<Distance>
            items={form.distances}
            onChange={(v) => set("distances", v)}
            newItem={() => ({ label: { es: "", en: "" }, value: "", minutes: undefined })}
            addLabel="Añadir distancia"
            render={(d, update, i) => (
              <div className="space-y-3">
                <I18nField label="Lugar" value={d.label} onChange={(label) => update({ label })} error={err(`distances.${i}.label.es`)} />
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="Valor mostrado" value={d.value} onChange={(value) => update({ value })} placeholder="10 min / 5 km" />
                  <NumberField label="Minutos" value={d.minutes ?? null} onChange={(v) => update({ minutes: v ?? undefined })} nullable min={0} />
                </div>
              </div>
            )}
          />
        </Section>

        <Section id="desarrollador" title="Desarrollador">
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="Nombre" value={form.developer.name} onChange={(v) => set("developer", { ...form.developer, name: v })} />
            <TextField label="Sitio web" value={form.developer.website ?? ""} onChange={(v) => set("developer", { ...form.developer, website: v })} placeholder="https://" />
          </div>
          <I18nField
            className="mt-4"
            label="Descripción"
            value={form.developer.description}
            onChange={(v) => set("developer", { ...form.developer, description: v })}
            multiline
            rows={4}
          />
        </Section>

        <Section id="multimedia" title="Video, tour y brochure">
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="URL de video (YouTube / Vimeo)" value={form.video_url} onChange={(v) => set("video_url", v || null)} error={err("video_url")} placeholder="https://youtube.com/…" />
            <TextField label="URL de tour virtual" value={form.tour_url} onChange={(v) => set("tour_url", v || null)} error={err("tour_url")} placeholder="https://my.matterport.com/…" />
          </div>
          <Field label="Brochure (PDF)" className="mt-4" error={err("brochure_url")}>
            <PdfUrlField value={form.brochure_url} onChange={(v) => set("brochure_url", v || null)} folder={`brochures/${id ?? "nuevo"}`} />
          </Field>
        </Section>

        <Section id="seo" title="SEO y URLs">
          <SeoEditor
            seo={form.seo}
            onSeo={(s) => set("seo", s)}
            slugEs={form.slug_es}
            slugEn={form.slug_en}
            onSlugs={(s) => {
              setSlugTouched(true);
              setForm((f) => ({ ...f, ...s }));
              setDirty(true);
            }}
            suggestFrom={{ es: form.name, en: form.name }}
            errors={errors}
          />
        </Section>

        <Section id="visibilidad" title="Visibilidad">
          <div className="grid gap-5 md:grid-cols-2">
            <Toggle checked={form.published} onChange={(v) => set("published", v)} label="Publicado" description="Visible en el sitio público." />
            <Toggle checked={form.featured} onChange={(v) => set("featured", v)} label="Destacado" description="Aparece en la home y listados destacados." />
            <Toggle
              checked={form.is_flagship}
              onChange={(v) => set("is_flagship", v)}
              label="Proyecto insignia"
              description="Masterplan principal (89 villas). Solo puede haber uno."
            />
            <Toggle
              checked={form.is_placeholder}
              onChange={(v) => set("is_placeholder", v)}
              label="Información de ejemplo"
              description="Muestra la etiqueta “información de ejemplo” si está activada en Ajustes."
            />
          </div>
        </Section>

        <SaveBar saving={saving} dirty={dirty} label={id ? "Guardar proyecto" : "Crear proyecto"} />
      </div>
    </form>
  );
}
