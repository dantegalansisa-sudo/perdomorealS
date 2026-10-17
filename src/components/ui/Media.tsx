import Image from "next/image";
import { useTranslations } from "next-intl";
import { ImageIcon } from "lucide-react";
import type { Locale, MediaItem } from "@/lib/types";
import { cn, tr } from "@/lib/utils";

export type Ratio = "4/3" | "16/9" | "1/1" | "3/4" | "21/9";
const RATIO_CLASS: Record<Ratio, string> = {
  "4/3": "aspect-[4/3]",
  "16/9": "aspect-video",
  "1/1": "aspect-square",
  "3/4": "aspect-[3/4]",
  "21/9": "aspect-[21/9]",
};

/** Elegant fixed-ratio placeholder. The ratio never changes when real photos arrive. */
export function ImagePlaceholder({ ratio = "4/3", className, label, compact = false }: { ratio?: Ratio; className?: string; label?: string; compact?: boolean }) {
  const t = useTranslations("common");
  return (
    <div
      className={cn(
        "relative isolate flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#e6ebf2] via-[#d9e1eb] to-[#c5d0de] text-navy-soft",
        RATIO_CLASS[ratio],
        className
      )}
      role="img"
      aria-label={label ?? t("imagesComingSoon")}
    >
      <svg className="absolute inset-0 -z-10 h-full w-full opacity-[0.35]" aria-hidden>
        <defs>
          <pattern id="ph-grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M28 0H0V28" fill="none" stroke="#0b1f3a" strokeOpacity="0.12" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ph-grid)" />
      </svg>
      <div className="flex flex-col items-center gap-2 px-4 text-center">
        <span className="grid size-10 place-items-center rounded-full border border-white/70 bg-white/80 text-gold-dark shadow-sm">
          <ImageIcon className="size-4" aria-hidden />
        </span>
        {!compact && <span className="text-[11px] font-semibold tracking-[0.18em] uppercase">{label ?? t("imagesComingSoon")}</span>}
      </div>
    </div>
  );
}

/** Real image when available, placeholder otherwise. Always reserves the box (no CLS). */
export function MediaImage({
  media,
  locale,
  ratio = "4/3",
  sizes = "(min-width: 1024px) 33vw, 100vw",
  priority = false,
  className,
  fallbackAlt = "",
  imgClassName,
}: {
  media?: MediaItem | null;
  locale: Locale;
  ratio?: Ratio;
  sizes?: string;
  priority?: boolean;
  className?: string;
  fallbackAlt?: string;
  imgClassName?: string;
}) {
  if (!media?.url) return <ImagePlaceholder ratio={ratio} className={className} compact={ratio === "1/1"} />;
  return (
    <div className={cn("relative overflow-hidden bg-sand-2", RATIO_CLASS[ratio], className)}>
      <Image
        src={media.url}
        alt={tr(media.alt, locale) || fallbackAlt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn("object-cover", imgClassName)}
      />
    </div>
  );
}

export const coverOf = (media?: MediaItem[]) => media?.find((m) => m.kind === "image" && m.is_cover) ?? media?.find((m) => m.kind === "image") ?? null;
