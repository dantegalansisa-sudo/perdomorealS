"use client";

import { useTranslations } from "next-intl";
import { PropertyCard } from "@/components/property/PropertyCard";
import { useRecent } from "@/lib/stores";
import type { Property } from "@/lib/types";

/** Strip of recently viewed properties (localStorage). Renders nothing when empty. */
export function RecentlyViewed({ properties, excludeId, className }: { properties: Property[]; excludeId?: string; className?: string }) {
  const t = useTranslations("common");
  const { items } = useRecent();
  const list = items
    .filter((id) => id !== excludeId)
    .map((id) => properties.find((p) => p.id === id))
    .filter((p): p is Property => Boolean(p))
    .slice(0, 4);
  if (list.length === 0) return null;
  return (
    <section className={className} aria-labelledby="recent-title">
      <h2 id="recent-title" className="mb-6 text-4xl">
        {t("recentlyViewed")}
      </h2>
      <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {list.map((p) => (
          <li key={p.id}>
            <PropertyCard property={p} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Records a property view. */
export function TrackRecent({ id }: { id: string }) {
  const { push } = useRecent();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffectOnce(() => push(id));
  return null;
}

import { useEffect } from "react";
function useEffectOnce(fn: () => void) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(fn, []);
}
