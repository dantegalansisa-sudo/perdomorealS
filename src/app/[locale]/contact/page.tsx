import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Clock, MapPin } from "lucide-react";
import { getSettings } from "@/lib/data";
import { buildMetadata, localizedUrl } from "@/lib/seo";
import type { Locale } from "@/lib/types";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LeadForm } from "@/components/forms/LeadForm";
import { Reveal } from "@/components/motion/Reveal";
import { LazyMap } from "@/components/map/LazyMap";
import { ContactChannels } from "@/components/sections/ContactChannels";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.contact" });
  return buildMetadata({ locale, pathname: "/contact", title: t("metaTitle"), description: t("metaDescription") });
}

export default async function ContactPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tc, s] = await Promise.all([getTranslations("pages.contact"), getTranslations("common"), getSettings()]);

  return (
    <div className="container-x pt-28 lg:pt-32">
      <Breadcrumbs items={[{ name: tc("home"), url: localizedUrl(locale, "/") }, { name: t("eyebrow"), url: localizedUrl(locale, "/contact") }]} />
      <div className="mt-6 grid gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <SectionHeading as="h1" immediate eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
          <Reveal delay={0.1}>
            <ContactChannels phone={s.phone} email={s.email} />
            <ul className="mt-6 space-y-4 text-sm">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-gold-dark" aria-hidden />
                <span>
                  <span className="block font-bold">{t("office")}</span>
                  <span className="text-stone">{s.address}</span>
                </span>
              </li>
              <li className="flex gap-3">
                <Clock className="mt-0.5 size-5 shrink-0 text-gold-dark" aria-hidden />
                <span>
                  <span className="block font-bold">{t("hours")}</span>
                  <span className="text-stone">{t("hoursValue")}</span>
                </span>
              </li>
            </ul>
          </Reveal>
        </div>
        <Reveal className="rounded-[2rem] bg-white p-6 shadow-[0_40px_80px_-50px_rgba(11,31,58,0.4)] sm:p-10">
          <h2 className="mb-6 text-4xl">{t("formTitle")}</h2>
          <LeadForm />
        </Reveal>
      </div>
      <Reveal className="mt-16 h-[380px] overflow-hidden rounded-[2rem] border border-line">
        <LazyMap markers={[{ id: "office", lat: 18.6825, lng: -68.4127, label: "Perdomo Real Estate" }]} center={[18.6825, -68.4127]} zoom={11} />
      </Reveal>
    </div>
  );
}
