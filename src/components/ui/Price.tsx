"use client";
import { useLocale, useTranslations } from "next-intl";
import { useSite } from "@/components/providers/SiteProvider";
import { formatPrice } from "@/lib/format";

/** Price in the visitor's selected currency. USD is the stored base. */
export function Price({ usd, from = false, compact = false, className }: { usd: number | null | undefined; from?: boolean; compact?: boolean; className?: string }) {
  const { currency, rates } = useSite();
  const locale = useLocale();
  const t = useTranslations("common");
  const value = formatPrice(usd, currency, rates, locale, compact);
  if (!value) return <span className={className}>{t("priceOnRequest")}</span>;
  return (
    <span className={className}>
      {from && <span className="mr-1 text-[0.7em] font-semibold tracking-wide text-stone uppercase">{t("from")}</span>}
      {value}
    </span>
  );
}
