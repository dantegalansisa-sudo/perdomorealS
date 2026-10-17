"use client";
import { useTranslations } from "next-intl";
import { Info } from "lucide-react";
import { useSite } from "@/components/providers/SiteProvider";
import { cn } from "@/lib/utils";

/** Discreet "Sample information" tag. Hidden globally from admin settings. */
export function PlaceholderBadge({ show = true, className }: { show?: boolean; className?: string }) {
  const { showPlaceholders } = useSite();
  const t = useTranslations("common");
  if (!show || !showPlaceholders) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-dashed border-gold/60 bg-gold-soft/40 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-gold-dark",
        className
      )}
      title={t("sampleInfoTooltip")}
    >
      <Info className="size-3" aria-hidden />
      {t("sampleInfo")}
    </span>
  );
}
