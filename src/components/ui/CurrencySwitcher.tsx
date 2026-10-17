"use client";
import { useTranslations } from "next-intl";
import { useSite } from "@/components/providers/SiteProvider";
import type { Currency } from "@/lib/format";
import { cn } from "@/lib/utils";

const CURRENCIES: Currency[] = ["USD", "DOP", "EUR"];

export function CurrencySwitcher({ className }: { className?: string }) {
  const { currency, setCurrency } = useSite();
  const t = useTranslations("common");
  return (
    <div role="group" aria-label={t("currency")} className={cn("inline-flex rounded-full border border-line bg-white/70 p-0.5 text-xs font-bold", className)}>
      {CURRENCIES.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => setCurrency(c)}
          aria-pressed={currency === c}
          className={cn("rounded-full px-2.5 py-1 transition-colors", currency === c ? "bg-navy text-white" : "text-navy-soft hover:text-navy")}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
