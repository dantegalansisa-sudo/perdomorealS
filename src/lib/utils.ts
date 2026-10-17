import { clsx, type ClassValue } from "clsx";
import type { I18nText, Locale } from "./types";

export const cn = (...inputs: ClassValue[]) => clsx(inputs);

/** Pick the active-locale string, falling back to the other language. */
export function tr(text: I18nText | null | undefined, locale: Locale | string): string {
  if (!text) return "";
  const l = locale === "en" ? "en" : "es";
  return text[l] || text[l === "es" ? "en" : "es"] || "";
}

export function slugOf(entity: { slug_es: string; slug_en: string }, locale: Locale | string) {
  return locale === "en" ? entity.slug_en : entity.slug_es;
}

export function waLink(number: string, message: string) {
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}

export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
