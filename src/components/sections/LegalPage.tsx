import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { StaticPathname } from "@/i18n/routing";
import { buildMetadata, localizedUrl } from "@/lib/seo";
import type { Locale } from "@/lib/types";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export type LegalKey = "privacy" | "cookies" | "terms" | "disclaimer";
const PATH: Record<LegalKey, StaticPathname> = {
  privacy: "/legal/privacy",
  cookies: "/legal/cookies",
  terms: "/legal/terms",
  disclaimer: "/legal/disclaimer",
};

export async function legalMetadata(locale: Locale, key: LegalKey): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: `pages.legal.${key}` });
  return buildMetadata({ locale, pathname: PATH[key], title: t("title"), description: t("metaDescription") });
}

/** Legal copy lives in messages (pages.legal.*.body) as trusted static HTML. */
export async function LegalPage({ locale, k }: { locale: Locale; k: LegalKey }) {
  const t = await getTranslations("pages.legal");
  const tc = await getTranslations("common");
  return (
    <div className="container-x max-w-3xl pt-28 lg:pt-32">
      <Breadcrumbs items={[{ name: tc("home"), url: localizedUrl(locale, "/") }, { name: t(`${k}.title`), url: localizedUrl(locale, PATH[k]) }]} />
      <h1 className="mt-6 text-[2.6rem] sm:text-6xl">{t(`${k}.title`)}</h1>
      <p className="mt-6 rounded-2xl border border-dashed border-gold/60 bg-gold-soft/30 p-4 text-sm text-gold-dark">{t("sampleNotice")}</p>
      <div className="prose-perdomo mt-10" dangerouslySetInnerHTML={{ __html: t.raw(`${k}.body`) as string }} />
    </div>
  );
}
