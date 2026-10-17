import type { MetadataRoute } from "next";
import { routing, type StaticPathname } from "@/i18n/routing";
import { getPosts, getProjects, getProperties } from "@/lib/data";
import { localizedUrl } from "@/lib/seo";

export const revalidate = 3600;

const STATIC: { path: StaticPathname; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, freq: "daily" },
  { path: "/villas-macao", priority: 0.95, freq: "daily" },
  { path: "/properties", priority: 0.9, freq: "daily" },
  { path: "/villas", priority: 0.85, freq: "weekly" },
  { path: "/apartments", priority: 0.85, freq: "weekly" },
  { path: "/houses", priority: 0.8, freq: "weekly" },
  { path: "/land", priority: 0.8, freq: "weekly" },
  { path: "/projects", priority: 0.85, freq: "weekly" },
  { path: "/about", priority: 0.5, freq: "monthly" },
  { path: "/contact", priority: 0.6, freq: "monthly" },
  { path: "/blog", priority: 0.7, freq: "weekly" },
  { path: "/legal/privacy", priority: 0.2, freq: "yearly" },
  { path: "/legal/cookies", priority: 0.2, freq: "yearly" },
  { path: "/legal/terms", priority: 0.2, freq: "yearly" },
  { path: "/legal/disclaimer", priority: 0.2, freq: "yearly" },
];

/** Dynamic sitemap with hreflang alternates for every page in both languages. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, properties, posts] = await Promise.all([getProjects(), getProperties(), getPosts()]);
  const entries: MetadataRoute.Sitemap = [];
  const alt = (fn: (l: "es" | "en") => string) => ({ languages: Object.fromEntries(routing.locales.map((l) => [l, fn(l)])) });

  for (const s of STATIC) {
    for (const l of routing.locales) {
      entries.push({ url: localizedUrl(l, s.path), changeFrequency: s.freq, priority: s.priority, alternates: alt((x) => localizedUrl(x, s.path)) });
    }
  }
  for (const p of projects.filter((x) => !x.is_flagship)) {
    const slugs = { es: p.slug_es, en: p.slug_en };
    for (const l of routing.locales)
      entries.push({ url: localizedUrl(l, "/projects/[slug]", slugs), lastModified: p.created_at, priority: 0.8, alternates: alt((x) => localizedUrl(x, "/projects/[slug]", slugs)) });
  }
  for (const p of properties) {
    const slugs = { es: p.slug_es, en: p.slug_en };
    for (const l of routing.locales)
      entries.push({ url: localizedUrl(l, "/properties/[slug]", slugs), lastModified: p.created_at, priority: 0.7, alternates: alt((x) => localizedUrl(x, "/properties/[slug]", slugs)) });
  }
  for (const p of posts) {
    const slugs = { es: p.slug_es, en: p.slug_en };
    for (const l of routing.locales)
      entries.push({ url: localizedUrl(l, "/blog/[slug]", slugs), lastModified: p.published_at, priority: 0.6, alternates: alt((x) => localizedUrl(x, "/blog/[slug]", slugs)) });
  }
  return entries;
}
