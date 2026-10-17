"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, MapPin } from "lucide-react";
import { saveProperty } from "@/app/admin/_actions/properties";
import { BADGES, CONSTRUCTION_STATUS, PROPERTY_TYPES, ZONE_SUGGESTIONS } from "@/lib/admin/constants";
import type { PropertyForm as PropertyFormState } from "@/lib/admin/defaults";
import type { Badge, ConstructionStatus, PropertyType } from "@/lib/types";
import { cn, slugify } from "@/lib/utils";
import { Section } from "./ui";
import { AmenitiesPicker, Field, I18nField, NumberField, SaveBar, SelectField, SeoEditor, TextField, Toggle, type FieldErrors } from "./fields";
import { useToast } from "./Toast";

export function PropertyForm({
  id,
  initial,
  projects,
}: {
  id: string | null;
  initial: PropertyFormState;
  projects: { id: string; name: string; zone: string }[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState<PropertyFormState>(initial);
  const [errors, setErrors] = useState<FieldErrors>();
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!!id);

  function set<K extends keyof PropertyFormState>(key: K, value: PropertyFormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrors(undefined);
    const res = await saveProperty(id, form);
    setSaving(false);
    if (!res.ok) {
      setErrors(res.fieldErrors);
      toast.error(res.error);
      return;
    }
    toast.success(res.message ?? "Guardado");
    setDirty(false);
    if (!id && res.data) router.push(`/admin/propiedades/${res.data.id}`);
    else router.refresh();
  }

  const err = (k: string) => errors?.[k];

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Section title="Contenido">
        <div className="space-y-4">
          <I18nField
            label="Título"
            required
            value={form.title}
            error={err("title.es")}
            onChange={(v) => {
              setForm((f) => ({
                ...f,
                title: v,
                ...(!slugTouched ? { slug_es: slugify(v.es), slug_en: slugify(v.en || v.es) } : {}),
              }));
              setDirty(true);
            }}
          />
          <I18nField label="Descripción" value={form.description} onChange={(v) => set("description", v)} multiline rows={7} />
        </div>
      </Section>

      <Section title="Clasificación">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SelectField
            label="Tipo"
            value={form.type}
            onChange={(v) => set("type", v as PropertyType)}
            options={Object.entries(PROPERTY_TYPES).map(([value, label]) => ({ value: value as PropertyType, label }))}
          />
          <SelectField
            label="Estado"
            value={form.status}
            onChange={(v) => set("status", v as ConstructionStatus)}
            options={Object.entries(CONSTRUCTION_STATUS).map(([value, label]) => ({ value: value as ConstructionStatus, label }))}
          />
          <Field label="Zona">
            <input className="field" list="zones-prop" value={form.zone} onChange={(e) => set("zone", e.target.value)} />
            <datalist id="zones-prop">
              {ZONE_SUGGESTIONS.map((z) => (
                <option key={z} value={z} />
              ))}
            </datalist>
          </Field>
          <Field label="Proyecto" error={err("project_id")}>
            <select
              className="field"
              value={form.project_id ?? ""}
              onChange={(e) => {
                const pid = e.target.value || null;
                const p = projects.find((x) => x.id === pid);
                setForm((f) => ({ ...f, project_id: pid, zone: f.zone || p?.zone || "" }));
                setDirty(true);
              }}
            >
              <option value="">— Ninguno (reventa / independiente)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="mt-5">
          <span className="label">Etiquetas (badges)</span>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(BADGES) as Badge[]).map((b) => {
              const on = form.badges.includes(b);
              return (
                <button
                  key={b}
                  type="button"
                  data-active={on}
                  className="chip"
                  onClick={() => set("badges", on ? form.badges.filter((x) => x !== b) : [...form.badges, b])}
                >
                  {BADGES[b]}
                </button>
              );
            })}
          </div>
        </div>
      </Section>

      <Section title="Precio y medidas">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <NumberField label="Precio (USD)" value={form.price} onChange={(v) => set("price", v)} nullable error={err("price")} className="col-span-2 md:col-span-1" />
          <NumberField label="Habitaciones" value={form.bedrooms} onChange={(v) => set("bedrooms", Math.round(v ?? 0))} step={1} min={0} />
          <NumberField label="Baños" value={form.bathrooms} onChange={(v) => set("bathrooms", v ?? 0)} step={0.5} min={0} />
          <NumberField label="Construcción" suffix="m²" value={form.built_m2} onChange={(v) => set("built_m2", v ?? 0)} min={0} />
          <NumberField label="Solar" suffix="m²" value={form.lot_m2} onChange={(v) => set("lot_m2", v ?? 0)} min={0} />
        </div>
      </Section>

      <Section title="Amenidades">
        <AmenitiesPicker value={form.amenities} onChange={(v) => set("amenities", v)} />
      </Section>

      <Section title="Ubicación">
        <div className="grid gap-4 md:grid-cols-2">
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

      <Section title="Video y tour virtual">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="URL de video" value={form.video_url} onChange={(v) => set("video_url", v || null)} error={err("video_url")} placeholder="https://youtube.com/…" />
          <TextField label="URL de tour virtual" value={form.tour_url} onChange={(v) => set("tour_url", v || null)} error={err("tour_url")} placeholder="https://" />
        </div>
      </Section>

      <Section title="SEO y URLs">
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
          suggestFrom={form.title}
          errors={errors}
        />
      </Section>

      <Section title="Visibilidad">
        <div className={cn("grid gap-5 md:grid-cols-3")}>
          <Toggle checked={form.published} onChange={(v) => set("published", v)} label="Publicada" description="Visible en el sitio." />
          <Toggle checked={form.featured} onChange={(v) => set("featured", v)} label="Destacar en home" description="Aparece en la portada." />
          <Toggle checked={form.is_placeholder} onChange={(v) => set("is_placeholder", v)} label="Información de ejemplo" />
        </div>
      </Section>

      <SaveBar saving={saving} dirty={dirty} label={id ? "Guardar propiedad" : "Crear propiedad"} />
    </form>
  );
}
