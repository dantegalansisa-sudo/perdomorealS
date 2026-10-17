import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { StaticPathname } from "@/i18n/routing";
import { getProjects, getProperties } from "@/lib/data";
import { localizedUrl } from "@/lib/seo";
import type { Locale, PropertyType } from "@/lib/types";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PropertySearch } from "./PropertySearch";

const CATEGORY_PATH: Record<PropertyType, StaticPathname> = { villa: "/villas", apartment: "/apartments", house: "/houses", land: "/land" };

/** Shared layout for /properties and the category landing pages (villas, apartments, houses, land). */
export async function ListingPage({ locale, type }: { locale: Locale; type?: PropertyType }) {
  const [t, tc, properties, projects] = await Promise.all([getTranslations("search"), getTranslations("common"), getProperties(), getProjects()]);
  const pathname: StaticPathname = type ? CATEGORY_PATH[type] : "/properties";
  const title = type ? t(`category.${type}.title`) : t("title");
  const lead = type ? t(`category.${type}.lead`) : t("lead");
  const crumbs = [
    { name: tc("home"), url: localizedUrl(locale, "/") },
    ...(type ? [{ name: tc("nav.properties"), url: localizedUrl(locale, "/properties") }] : []),
    { name: title, url: localizedUrl(locale, pathname) },
  ];
  const others = (Object.keys(CATEGORY_PATH) as PropertyType[]).filter((k) => k !== type);

  return (
    <div className="container-x pt-28 lg:pt-32">
      <Breadcrumbs items={crumbs} />
      <SectionHeading as="h1" immediate eyebrow={t("eyebrow")} title={title} lead={lead} className="mt-6 mb-12" />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-[2rem] bg-sand-2" />}>
        <PropertySearch properties={properties} projects={projects.map((p) => ({ id: p.id, name: p.name }))} lockedType={type} />
      </Suspense>
      {type && (
        <nav aria-label={t("category.related")} className="mt-20">
          <p className="eyebrow mb-4">{t("category.related")}</p>
          <ul className="flex flex-wrap gap-3">
            {others.map((k) => (
              <li key={k}>
                <Link href={CATEGORY_PATH[k]} className="chip px-5 py-2.5 text-sm">
                  {t(`category.${k}.title`)} <ArrowUpRight className="size-4" aria-hidden />
                </Link>
              </li>
            ))}
            <li>
              <Link href="/villas-macao" className="chip px-5 py-2.5 text-sm">
                {tc("nav.villasMacao")} Macao <ArrowUpRight className="size-4" aria-hidden />
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}

export async function listingMetadata(locale: Locale, type?: PropertyType) {
  const t = await getTranslations({ locale, namespace: "search" });
  return {
    pathname: type ? CATEGORY_PATH[type] : ("/properties" as StaticPathname),
    title: type ? t(`category.${type}.metaTitle`) : t("meta.title"),
    description: type ? t(`category.${type}.metaDescription`) : t("meta.description"),
  };
}
