import { SITE_URL } from "@/lib/env";
import { BRAND } from "@/lib/seo";
import type { Faq, Locale, Post, Property, SiteSettings } from "@/lib/types";
import { tr } from "@/lib/utils";

/**
 * JSON-LD builders. Rule: placeholder content (is_placeholder) is NEVER emitted,
 * Offers only carry real prices, and no reviews/ratings are ever generated.
 */

export function realEstateAgentSchema(settings: SiteSettings, locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": `${SITE_URL}/#agent`,
    name: BRAND,
    url: `${SITE_URL}/${locale}`,
    logo: `${SITE_URL}/icon.svg`,
    image: `${SITE_URL}/og-default.png`,
    email: settings.email || undefined,
    telephone: settings.phone || undefined,
    areaServed: ["Punta Cana", "Bávaro", "Macao", "Cap Cana"],
    address: { "@type": "PostalAddress", addressLocality: "Punta Cana", addressRegion: "La Altagracia", addressCountry: "DO" },
    sameAs: Object.values(settings.socials ?? {}).filter((u) => u && u.length > 12),
  };
}

export function websiteSchema(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: BRAND,
    url: `${SITE_URL}/${locale}`,
    inLanguage: locale,
    publisher: { "@id": `${SITE_URL}/#agent` },
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: it.url })),
  };
}

export function faqSchema(faqs: Faq[], locale: Locale) {
  const real = faqs.filter((f) => !f.is_placeholder);
  if (real.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: real.map((f) => ({
      "@type": "Question",
      name: tr(f.question, locale),
      acceptedAnswer: { "@type": "Answer", text: tr(f.answer, locale) },
    })),
  };
}

export function blogPostingSchema(post: Post, locale: Locale, url: string) {
  if (post.is_placeholder) return null;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: tr(post.title, locale),
    description: tr(post.excerpt, locale),
    datePublished: post.published_at,
    inLanguage: locale,
    mainEntityOfPage: url,
    image: post.cover_url || undefined,
    author: { "@type": "Organization", name: post.author || BRAND },
    publisher: { "@id": `${SITE_URL}/#agent` },
  };
}

/** Listing with an Offer — only when the property is real and has a real price. */
export function propertyOfferSchema(p: Property, locale: Locale, url: string) {
  if (p.is_placeholder || !p.price) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: tr(p.title, locale),
    description: tr(p.description, locale),
    url,
    image: p.media?.[0]?.url,
    offers: {
      "@type": "Offer",
      price: p.price,
      priceCurrency: "USD",
      availability: p.badges.includes("sold") ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
      url,
    },
  };
}
