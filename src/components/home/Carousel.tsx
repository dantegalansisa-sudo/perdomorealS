"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { PropertyCard } from "@/components/property/PropertyCard";
import type { Property } from "@/lib/types";

/** Horizontal scroll-snap carousel of property cards with arrow controls. */
export function PropertyCarousel({ properties }: { properties: Property[] }) {
  const t = useTranslations("home.properties");
  const track = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector("li");
    el.scrollBy({ left: dir * ((card?.clientWidth ?? 320) + 20), behavior: "smooth" });
  };
  return (
    <div>
      <div className="mb-6 flex justify-end gap-2">
        <button type="button" onClick={() => scroll(-1)} aria-label={t("prev")} className="grid size-12 place-items-center rounded-full border border-line bg-white transition-colors hover:border-gold">
          <ArrowLeft className="size-4" />
        </button>
        <button type="button" onClick={() => scroll(1)} aria-label={t("next")} className="grid size-12 place-items-center rounded-full bg-navy text-white transition-colors hover:bg-navy-2">
          <ArrowRight className="size-4" />
        </button>
      </div>
      <div ref={track} className="no-scrollbar -mx-4 snap-x snap-mandatory overflow-x-auto scroll-px-4 px-4 pb-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0" data-lenis-prevent-wheel>
        <ul className="flex gap-5">
          {properties.map((p) => (
            <li key={p.id} className="w-[84%] shrink-0 snap-start min-[480px]:w-[60%] md:w-[44%] lg:w-[31.5%]">
              <PropertyCard property={p} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
