import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Compass, Eye, HeartHandshake } from "lucide-react";
import { buildMetadata, localizedUrl } from "@/lib/seo";
import type { Locale } from "@/lib/types";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ImagePlaceholder } from "@/components/ui/Media";
import { PlaceholderBadge } from "@/components/ui/PlaceholderBadge";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { ClipReveal } from "@/components/motion/Parallax";
import { OpenLeadButton } from "@/components/forms/OpenLeadButton";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.about" });
  return buildMetadata({ locale, pathname: "/about", title: t("metaTitle"), description: t("metaDescription") });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.about");
  const tc = await getTranslations("common");
  const values = [
    { k: "clarity", icon: Eye },
    { k: "closeness", icon: HeartHandshake },
    { k: "care", icon: Compass },
  ] as const;

  return (
    <div className="container-x pt-28 lg:pt-32">
      <Breadcrumbs items={[{ name: tc("home"), url: localizedUrl(locale, "/") }, { name: t("eyebrow"), url: localizedUrl(locale, "/about") }]} />
      <div className="mt-6 grid gap-12 lg:grid-cols-2 lg:items-end">
        <SectionHeading as="h1" immediate eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
        <ClipReveal className="overflow-hidden rounded-[2rem]">
          <ImagePlaceholder ratio="4/3" />
        </ClipReveal>
      </div>

      <section className="mt-24 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <Reveal>
          <h2 className="text-5xl">{t("storyTitle")}</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="text-lg leading-relaxed text-navy-soft">{t("story")}</p>
          <PlaceholderBadge className="mt-4" />
        </Reveal>
      </section>

      <section className="mt-24">
        <SectionHeading title={t("valuesTitle")} />
        <Stagger className="mt-10 grid gap-4 md:grid-cols-3">
          {values.map(({ k, icon: Icon }) => (
            <StaggerItem key={k} className="card p-8">
              <Icon className="size-8 text-gold-dark" aria-hidden />
              <h3 className="mt-6 font-sans text-xl font-bold tracking-normal normal-case">{t(`values.${k}.title`)}</h3>
              <p className="mt-2 text-stone">{t(`values.${k}.text`)}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="mt-24">
        <SectionHeading title={t("teamTitle")} lead={t("teamText")} />
        <Stagger className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <StaggerItem key={n}>
              <ImagePlaceholder ratio="3/4" className="rounded-[1.5rem]" compact />
              <p className="mt-3 font-bold">—</p>
              <p className="text-sm text-stone">{t("member")}</p>
            </StaggerItem>
          ))}
        </Stagger>
        <Reveal className="mt-14 text-center">
          <OpenLeadButton type="info" className="btn btn-gold">
            {t("cta")}
          </OpenLeadButton>
        </Reveal>
      </section>
    </div>
  );
}
