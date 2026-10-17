"use client";
import { useId } from "react";
import { Wand2 } from "lucide-react";
import { cn, slugify } from "@/lib/utils";
import type { AmenityKey, I18nText, Seo } from "@/lib/types";
import { AMENITIES } from "@/lib/admin/constants";

export type FieldErrors = Record<string, string> | undefined;

export function Field({
  label,
  hint,
  error,
  className,
  children,
  htmlFor,
}: {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: string;
  className?: string;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      {label && (
        <label className="label" htmlFor={htmlFor}>
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1 text-xs font-semibold text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-stone">{hint}</p>
      ) : null}
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  error,
  hint,
  className,
  ...rest
}: {
  label?: React.ReactNode;
  value: string | null | undefined;
  onChange: (v: string) => void;
  error?: string;
  hint?: React.ReactNode;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  const id = useId();
  return (
    <Field label={label} error={error} hint={hint} className={className} htmlFor={id}>
      <input id={id} className={cn("field", error && "border-red-300")} value={value ?? ""} onChange={(e) => onChange(e.target.value)} {...rest} />
    </Field>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  error,
  hint,
  rows = 4,
  className,
  placeholder,
}: {
  label?: React.ReactNode;
  value: string | null | undefined;
  onChange: (v: string) => void;
  error?: string;
  hint?: React.ReactNode;
  rows?: number;
  className?: string;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <Field label={label} error={error} hint={hint} className={className} htmlFor={id}>
      <textarea id={id} rows={rows} placeholder={placeholder} className={cn("field resize-y", error && "border-red-300")} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

/** Numeric input. `nullable` → empty string becomes null. */
export function NumberField({
  label,
  value,
  onChange,
  nullable,
  error,
  hint,
  className,
  step = "any",
  min,
  max,
  placeholder,
  suffix,
}: {
  label?: React.ReactNode;
  value: number | null | undefined;
  onChange: (v: number | null) => void;
  nullable?: boolean;
  error?: string;
  hint?: React.ReactNode;
  className?: string;
  step?: string | number;
  min?: number;
  max?: number;
  placeholder?: string;
  suffix?: string;
}) {
  const id = useId();
  return (
    <Field label={label} error={error} hint={hint} className={className} htmlFor={id}>
      <div className="relative">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          step={step}
          min={min}
          max={max}
          placeholder={placeholder}
          className={cn("field", suffix && "pr-12", error && "border-red-300")}
          value={value === null || value === undefined || Number.isNaN(value) ? "" : value}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === "") onChange(nullable ? null : 0);
            else onChange(Number(raw));
          }}
        />
        {suffix && <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-stone">{suffix}</span>}
      </div>
    </Field>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
  error,
  hint,
  className,
  placeholder,
}: {
  label?: React.ReactNode;
  value: T | "" | null | undefined;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  error?: string;
  hint?: React.ReactNode;
  className?: string;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <Field label={label} error={error} hint={hint} className={className} htmlFor={id}>
      <select id={id} className={cn("field", error && "border-red-300")} value={value ?? ""} onChange={(e) => onChange(e.target.value as T)}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

/** Bilingual text input: ES | EN side by side (stacked on mobile). */
export function I18nField({
  label,
  value,
  onChange,
  multiline,
  rows = 3,
  error,
  hint,
  className,
  placeholder,
  required,
}: {
  label: React.ReactNode;
  value: I18nText | null | undefined;
  onChange: (v: I18nText) => void;
  multiline?: boolean;
  rows?: number;
  error?: string;
  hint?: React.ReactNode;
  className?: string;
  placeholder?: { es?: string; en?: string };
  required?: boolean;
}) {
  const v = value ?? { es: "", en: "" };
  const id = useId();
  const input = (lang: "es" | "en") => {
    const common = {
      id: `${id}-${lang}`,
      className: cn("field", multiline && "resize-y", error && lang === "es" && "border-red-300"),
      value: v[lang] ?? "",
      placeholder: placeholder?.[lang],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ ...v, [lang]: e.target.value }),
    };
    return multiline ? <textarea rows={rows} {...common} /> : <input {...common} />;
  };
  return (
    <div className={cn("min-w-0", className)}>
      <span className="label">
        {label}
        {required && <span className="text-gold-dark"> *</span>}
      </span>
      <div className="grid gap-2 md:grid-cols-2">
        <div className="relative">
          <LangTag lang="ES" />
          {input("es")}
        </div>
        <div className="relative">
          <LangTag lang="EN" />
          {input("en")}
        </div>
      </div>
      {error ? <p className="mt-1 text-xs font-semibold text-red-600">{error}</p> : hint ? <p className="mt-1 text-xs text-stone">{hint}</p> : null}
    </div>
  );
}

function LangTag({ lang }: { lang: string }) {
  return (
    <span className="pointer-events-none absolute -top-2 right-3 z-10 rounded-full border border-line bg-sand px-1.5 text-[9px] font-extrabold tracking-widest text-stone">
      {lang}
    </span>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled,
  className,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <label className={cn("flex cursor-pointer items-start gap-3", disabled && "cursor-not-allowed opacity-60", className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
          checked ? "bg-gold" : "bg-sand-3"
        )}
      >
        <span className={cn("inline-block size-5 rounded-full bg-white shadow transition-transform", checked ? "translate-x-5.5" : "translate-x-0.5")} />
      </button>
      {(label || description) && (
        <span className="min-w-0">
          {label && <span className="block text-sm font-bold text-navy">{label}</span>}
          {description && <span className="block text-xs text-stone">{description}</span>}
        </span>
      )}
    </label>
  );
}

export function AmenitiesPicker({ value, onChange }: { value: AmenityKey[]; onChange: (v: AmenityKey[]) => void }) {
  const set = new Set(value);
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {AMENITIES.map((a) => {
        const on = set.has(a.key);
        return (
          <label
            key={a.key}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors",
              on ? "border-gold bg-gold-soft/60 text-navy" : "border-line bg-white text-navy-soft hover:border-gold/60"
            )}
          >
            <input
              type="checkbox"
              className="size-4 accent-[var(--color-gold-dark)]"
              checked={on}
              onChange={(e) => {
                const next = new Set(set);
                if (e.target.checked) next.add(a.key);
                else next.delete(a.key);
                onChange(AMENITIES.filter((x) => next.has(x.key)).map((x) => x.key));
              }}
            />
            {a.label}
          </label>
        );
      })}
    </div>
  );
}

/** Slugs (ES/EN) + SEO title/description per language. */
export function SeoEditor({
  seo,
  onSeo,
  slugEs,
  slugEn,
  onSlugs,
  suggestFrom,
  errors,
}: {
  seo: Seo;
  onSeo: (s: Seo) => void;
  slugEs: string;
  slugEn: string;
  onSlugs: (s: { slug_es: string; slug_en: string }) => void;
  suggestFrom: { es: string; en: string };
  errors?: FieldErrors;
}) {
  const s = { es: { title: "", description: "", ...(seo.es ?? {}) }, en: { title: "", description: "", ...(seo.en ?? {}) } };
  const set = (lang: "es" | "en", key: "title" | "description", val: string) => onSeo({ ...s, [lang]: { ...s[lang], [key]: val } });
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        {(["es", "en"] as const).map((lang) => {
          const slugVal = lang === "es" ? slugEs : slugEn;
          const err = errors?.[`slug_${lang}`];
          return (
            <Field key={lang} label={`Slug ${lang.toUpperCase()}`} error={err} hint={`/${lang}/…/${slugVal || "slug"}`}>
              <div className="flex gap-2">
                <input
                  className={cn("field font-mono text-sm", err && "border-red-300")}
                  value={slugVal}
                  onChange={(e) => onSlugs({ slug_es: lang === "es" ? e.target.value : slugEs, slug_en: lang === "en" ? e.target.value : slugEn })}
                  onBlur={(e) => {
                    const clean = slugify(e.target.value);
                    onSlugs({ slug_es: lang === "es" ? clean : slugEs, slug_en: lang === "en" ? clean : slugEn });
                  }}
                />
                <button
                  type="button"
                  title="Sugerir desde el nombre"
                  className="btn btn-ghost btn-sm shrink-0 !px-3"
                  onClick={() => {
                    const src = suggestFrom[lang] || suggestFrom.es;
                    onSlugs({
                      slug_es: lang === "es" ? slugify(src) : slugEs,
                      slug_en: lang === "en" ? slugify(src) : slugEn,
                    });
                  }}
                >
                  <Wand2 className="size-4" />
                </button>
              </div>
            </Field>
          );
        })}
      </div>
      {(["es", "en"] as const).map((lang) => (
        <div key={lang} className="grid gap-4 rounded-2xl border border-line bg-sand/60 p-4 md:grid-cols-2">
          <Field label={`Título SEO ${lang.toUpperCase()}`} hint={`${s[lang].title.length}/60 caracteres recomendados`}>
            <input className="field" value={s[lang].title} onChange={(e) => set(lang, "title", e.target.value)} />
          </Field>
          <Field label={`Meta descripción ${lang.toUpperCase()}`} hint={`${s[lang].description.length}/155 caracteres recomendados`}>
            <textarea rows={2} className="field resize-y" value={s[lang].description} onChange={(e) => set(lang, "description", e.target.value)} />
          </Field>
        </div>
      ))}
    </div>
  );
}

/** Small sticky save bar used at the bottom of long forms. */
export function SaveBar({
  saving,
  dirty,
  onSave,
  label = "Guardar cambios",
  extra,
}: {
  saving: boolean;
  dirty?: boolean;
  onSave?: () => void;
  label?: string;
  extra?: React.ReactNode;
}) {
  return (
    <div className="sticky bottom-[4.5rem] z-30 lg:bottom-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white/95 px-4 py-3 shadow-xl shadow-navy/10 backdrop-blur">
        <p className="text-xs font-semibold text-stone">{saving ? "Guardando…" : dirty ? "Tienes cambios sin guardar" : "Todo guardado"}</p>
        <div className="flex items-center gap-2">
          {extra}
          <button type={onSave ? "button" : "submit"} onClick={onSave} disabled={saving} className="btn btn-gold btn-sm disabled:opacity-60">
            {saving ? "Guardando…" : label}
          </button>
        </div>
      </div>
    </div>
  );
}
