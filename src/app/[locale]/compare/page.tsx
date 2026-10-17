import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getProperties } from "@/lib/data";
import { buildMetadata, localizedUrl } from "@/lib/seo";
import type { Locale } from "@/lib/types";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CompareView } from "@/components/search/SavedViews";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.compare" });
  return buildMetadata({ locale, pathname: "/compare", title: t("metaTitle"), description: t("metaDescription"), noindex: true });
}

export default async function ComparePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tc, properties] = await Promise.all([getTranslations("pages.compare"), getTranslations("common"), getProperties()]);
  return (
    <div className="container-x pt-28 lg:pt-32">
      <Breadcrumbs items={[{ name: tc("home"), url: localizedUrl(locale, "/") }, { name: t("eyebrow"), url: localizedUrl(locale, "/compare") }]} />
      <SectionHeading as="h1" immediate eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} className="mt-6 mb-10" />
      <CompareView properties={properties} />
    </div>
  );
}
