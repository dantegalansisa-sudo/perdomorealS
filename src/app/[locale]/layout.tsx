import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { anton, manrope } from "@/app/fonts";
import { getProjects, getSettings } from "@/lib/data";
import { SITE_URL } from "@/lib/env";
import { realEstateAgentSchema, websiteSchema } from "@/lib/schema";
import type { Locale } from "@/lib/types";
import { SiteProvider } from "@/components/providers/SiteProvider";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { CursorFollower } from "@/components/providers/CursorFollower";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppButton";
import { MobileBar } from "@/components/layout/MobileBar";
import { ConsentAnalytics } from "@/components/layout/ConsentAnalytics";
import { LeadModal } from "@/components/forms/LeadModal";
import { JsonLd } from "@/components/ui/JsonLd";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = { themeColor: "#ffffff", width: "device-width", initialScale: 1 };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common" });
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t("meta.title"), template: "%s | Perdomo Real Estate" },
    description: t("meta.description"),
    applicationName: "Perdomo Real Estate",
    formatDetection: { telephone: false },
    // Google Search Console HTML-tag verification (alternative: DNS record on the domain).
    verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } : undefined,
  };
}

// Consent Mode v2 defaults: everything denied until the visitor accepts.
const consentDefaults = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('consent','default',{ad_storage:'denied',analytics_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});`;

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const [settings, projects] = await Promise.all([getSettings(), getProjects()]);

  return (
    <html lang={locale} className={`${anton.variable} ${manrope.variable}`}>
      <body className="min-h-dvh">
        <Script id="consent-default" strategy="beforeInteractive">{consentDefaults}</Script>
        <NextIntlClientProvider>
          <SiteProvider
            settings={{
              whatsappNumber: settings.whatsapp_number,
              whatsappDefault: settings.whatsapp_default_message,
              whatsappProjects: settings.whatsapp_project_messages ?? {},
              email: settings.email,
              phone: settings.phone,
              rates: settings.exchange_rates,
              showPlaceholders: settings.show_placeholder_labels,
              gtmId: settings.gtm_id,
              ga4Id: settings.ga4_id,
              projects: projects.map((p) => ({ id: p.id, name: p.name })),
            }}
          >
            <Header />
            <main id="main">{children}</main>
            <Footer />
            <WhatsAppFloat />
            <MobileBar />
            <LeadModal />
            <ConsentAnalytics />
            <SmoothScroll />
            <CursorFollower />
          </SiteProvider>
        </NextIntlClientProvider>
        <JsonLd data={[realEstateAgentSchema(settings, locale as Locale), websiteSchema(locale as Locale)]} />
      </body>
    </html>
  );
}
