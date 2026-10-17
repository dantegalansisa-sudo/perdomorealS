"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Bath, BedDouble, GitCompareArrows, Heart, MapPin, Ruler } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ImagePlaceholder } from "@/components/ui/Media";
import { PlaceholderBadge } from "@/components/ui/PlaceholderBadge";
import { Price } from "@/components/ui/Price";
import { useCompare, useFavorites } from "@/lib/stores";
import type { Badge, Property } from "@/lib/types";
import { cn, slugOf, tr } from "@/lib/utils";

const BADGE_STYLE: Record<Badge, string> = {
  new: "bg-navy text-white",
  presale: "bg-gold text-navy",
  last_units: "bg-white text-navy ring-1 ring-gold",
  sold: "bg-sold text-white",
};

export function PropertyBadges({ badges, className }: { badges: Badge[]; className?: string }) {
  const t = useTranslations("common");
  if (!badges.length) return null;
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {badges.map((b) => (
        <span key={b} className={cn("rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase", BADGE_STYLE[b])}>
          {t(`badges.${b}`)}
        </span>
      ))}
    </div>
  );
}

export function PropertyActions({ id, className }: { id: string; className?: string }) {
  const t = useTranslations("common");
  const fav = useFavorites();
  const cmp = useCompare();
  const isFav = fav.has(id);
  const isCmp = cmp.has(id);
  return (
    <div className={cn("flex gap-1.5", className)}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          fav.toggle(id);
        }}
        aria-label={isFav ? t("removeFavorite") : t("addFavorite")}
        aria-pressed={isFav}
        className={cn("grid size-9 place-items-center rounded-full backdrop-blur transition-colors", isFav ? "bg-gold text-navy" : "bg-white/85 text-navy hover:bg-white")}
      >
        <Heart className={cn("size-4", isFav && "fill-current")} />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          if (!cmp.toggle(id)) alert(t("compareFull"));
        }}
        aria-label={isCmp ? t("removeCompare") : t("addCompare")}
        aria-pressed={isCmp}
        title={isCmp ? t("removeCompare") : t("addCompare")}
        className={cn("grid size-9 place-items-center rounded-full backdrop-blur transition-colors", isCmp ? "bg-navy text-white" : "bg-white/85 text-navy hover:bg-white")}
      >
        <GitCompareArrows className="size-4" />
      </button>
    </div>
  );
}

export function PropertyCard({
  property: p,
  layout = "grid",
  active = false,
  onHover,
  priority = false,
}: {
  property: Property;
  layout?: "grid" | "list";
  active?: boolean;
  onHover?: (id: string | null) => void;
  priority?: boolean;
}) {
  const locale = useLocale();
  const t = useTranslations("common");
  const cover = p.media?.find((m) => m.is_cover && m.kind === "image") ?? p.media?.find((m) => m.kind === "image");
  const list = layout === "list";

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => onHover?.(p.id)}
      onMouseLeave={() => onHover?.(null)}
      className={cn(
        "group relative overflow-hidden rounded-[1.75rem] border bg-white transition-shadow duration-500 hover:shadow-[0_30px_60px_-30px_rgba(11,31,58,0.35)]",
        active ? "border-gold shadow-[0_20px_50px_-25px_rgba(201,169,97,0.8)]" : "border-line",
        list && "sm:grid sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
      )}
    >
      <div className="relative overflow-hidden">
        {cover ? (
          <div className="relative aspect-[4/3] bg-sand-2">
            <Image
              src={cover.url}
              alt={tr(cover.alt, locale) || tr(p.title, locale)}
              fill
              priority={priority}
              sizes={list ? "(min-width: 640px) 40vw, 100vw" : "(min-width: 1280px) 30vw, (min-width: 640px) 50vw, 100vw"}
              className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
            />
          </div>
        ) : (
          <ImagePlaceholder ratio="4/3" className="transition-transform duration-[1.2s] ease-out group-hover:scale-105" />
        )}
        <PropertyBadges badges={p.badges} className="absolute top-3 left-3" />
        <PropertyActions id={p.id} className="absolute top-3 right-3 z-10" />
      </div>
      <div className="flex flex-col p-5">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-stone">
          <span className="font-bold tracking-wider text-gold-dark uppercase">{t(`types.${p.type}`)}</span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3" aria-hidden />
            {p.zone}
          </span>
          <PlaceholderBadge show={p.is_placeholder} />
        </div>
        <h3 className="font-sans text-lg leading-snug font-bold tracking-normal normal-case">
          <Link href={{ pathname: "/properties/[slug]", params: { slug: slugOf(p, locale) } }} className="after:absolute after:inset-0">
            {tr(p.title, locale)}
          </Link>
        </h3>
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-navy-soft">
          {p.type !== "land" && (
            <>
              <li className="inline-flex items-center gap-1.5">
                <BedDouble className="size-4 text-gold-dark" aria-hidden />
                {p.bedrooms} <span className="sr-only">{t("specs.bedroomsShort")}</span>
              </li>
              <li className="inline-flex items-center gap-1.5">
                <Bath className="size-4 text-gold-dark" aria-hidden />
                {p.bathrooms} <span className="sr-only">{t("specs.bathroomsShort")}</span>
              </li>
            </>
          )}
          <li className="inline-flex items-center gap-1.5">
            <Ruler className="size-4 text-gold-dark" aria-hidden />
            {p.type === "land" || !p.built_m2 ? p.lot_m2 : p.built_m2} m²
          </li>
        </ul>
        <div className="mt-4 flex items-end justify-between border-t border-line pt-4">
          <Price usd={p.price} className="font-display text-2xl" />
          <span className="text-xs font-semibold text-stone">{t(`status.${p.status}`)}</span>
        </div>
      </div>
    </motion.article>
  );
}
