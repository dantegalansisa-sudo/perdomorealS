"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { savePost } from "@/app/admin/_actions/posts";
import { POST_CATEGORIES } from "@/lib/admin/constants";
import type { PostForm as PostFormState } from "@/lib/admin/defaults";
import { slugify } from "@/lib/utils";
import { Section } from "./ui";
import { Field, I18nField, SaveBar, SelectField, SeoEditor, TextField, Toggle, type FieldErrors } from "./fields";
import { RichTextEditor } from "./RichTextEditor";
import { ImageUrlField } from "./FileUpload";
import { useToast } from "./Toast";

/** ISO → value for <input type="datetime-local"> in the browser's timezone. */
function toLocalInput(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

export function PostForm({ id, initial }: { id: string | null; initial: PostFormState }) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState<PostFormState>(initial);
  const [errors, setErrors] = useState<FieldErrors>();
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!!id);

  function set<K extends keyof PostFormState>(key: K, value: PostFormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrors(undefined);
    const res = await savePost(id, form);
    setSaving(false);
    if (!res.ok) {
      setErrors(res.fieldErrors);
      toast.error(res.error);
      return;
    }
    toast.success(res.message ?? "Guardado");
    setDirty(false);
    if (!id && res.data) router.push(`/admin/blog/${res.data.id}`);
    else router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-5">
          <Section title="Artículo">
            <div className="space-y-4">
              <I18nField
                label="Título"
                required
                value={form.title}
                error={errors?.["title.es"]}
                onChange={(v) => {
                  setForm((f) => ({ ...f, title: v, ...(!slugTouched ? { slug_es: slugify(v.es), slug_en: slugify(v.en || v.es) } : {}) }));
                  setDirty(true);
                }}
              />
              <I18nField label="Extracto" value={form.excerpt} onChange={(v) => set("excerpt", v)} multiline rows={3} hint="Resumen corto para listados y redes sociales." />
              <RichTextEditor value={form.content} onChange={(v) => set("content", v)} />
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
        </div>

        <div className="space-y-5">
          <Section title="Publicación">
            <div className="space-y-4">
              <Toggle checked={form.published} onChange={(v) => set("published", v)} label="Publicado" description="Visible en el blog." />
              <Field label="Fecha de publicación" error={errors?.published_at}>
                <input
                  type="datetime-local"
                  className="field"
                  value={toLocalInput(form.published_at)}
                  onChange={(e) => e.target.value && set("published_at", new Date(e.target.value).toISOString())}
                />
              </Field>
              <SelectField
                label="Categoría"
                value={form.category}
                onChange={(v) => set("category", v)}
                options={Object.entries(POST_CATEGORIES).map(([value, label]) => ({ value, label }))}
              />
              <TextField label="Autor" value={form.author} onChange={(v) => set("author", v)} error={errors?.author} />
              <Toggle checked={form.is_placeholder} onChange={(v) => set("is_placeholder", v)} label="Información de ejemplo" />
            </div>
          </Section>
          <Section title="Imagen de portada">
            <ImageUrlField value={form.cover_url} onChange={(v) => set("cover_url", v || null)} folder={`post/${id ?? "covers"}`} />
            {errors?.cover_url && <p className="mt-1 text-xs font-semibold text-red-600">{errors.cover_url}</p>}
          </Section>
        </div>
      </div>
      <SaveBar saving={saving} dirty={dirty} label={id ? "Guardar artículo" : "Crear artículo"} />
    </form>
  );
}
