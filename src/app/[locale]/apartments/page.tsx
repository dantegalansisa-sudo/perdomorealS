import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ListingPage, listingMetadata } from "@/components/search/ListingPage";
import { buildMetadata } from "@/lib/seo";
import type { Locale } from "@/lib/types";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = await listingMetadata(locale, "apartment");
  return buildMetadata({ locale, ...m });
}

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ListingPage locale={locale} type="apartment" />;
}
