import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing, type AppPathname } from "@/i18n/routing";
import { SITE_URL } from "@/lib/env";
import type { Locale, Seo } from "@/lib/types";

type Href = Parameters<typeof getPathname>[0]["href"];

export const BRAND = "Perdomo Real Estate";

/** Absolute localized URL for an internal pathname. `slugs` gives a per-locale [slug] param. */
export function localizedUrl(locale: Locale, pathname: AppPathname, slugs?: { es: string; en: string }) {
  const href = (slugs ? { pathname, params: { slug: slugs[locale] } } : pathname) as Href;
  return SITE_URL + getPathname({ locale, href });
}

export function alternatesFor(locale: Locale, pathname: AppPathname, slugs?: { es: string; en: string }) {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[l] = localizedUrl(l, pathname, slugs);
  languages["x-default"] = localizedUrl(routing.defaultLocale, pathname, slugs);
  return { canonical: localizedUrl(locale, pathname, slugs), languages };
}

export function buildMetadata(opts: {
  locale: Locale;
  pathname: AppPathname;
  slugs?: { es: string; en: string };
  title: string;
  description: string;
  seo?: Seo;
  image?: string | null;
  type?: "website" | "article";
  noindex?: boolean;
}): Metadata {
  const override = opts.seo?.[opts.locale];
  const title = override?.title || opts.title;
  const description = override?.description || opts.description;
  const alternates = alternatesFor(opts.locale, opts.pathname, opts.slugs);
  const images = opts.image ? [{ url: opts.image, width: 1200, height: 630 }] : [{ url: `${SITE_URL}/og-default.png`, width: 1200, height: 630 }];
  return {
    title: { absolute: title.includes(BRAND) ? title : `${title} | ${BRAND}` },
    description,
    alternates,
    robots: opts.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: opts.type ?? "website",
      siteName: BRAND,
      title,
      description,
      url: alternates.canonical,
      locale: opts.locale === "es" ? "es_DO" : "en_US",
      alternateLocale: opts.locale === "es" ? ["en_US"] : ["es_DO"],
      images,
    },
    twitter: { card: "summary_large_image", title, description, images: images.map((i) => i.url) },
  };
}
