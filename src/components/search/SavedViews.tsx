"use client";

import { useLocale, useTranslations } from "next-intl";
import { Check, Minus, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PropertyCard } from "@/components/property/PropertyCard";
import { ImagePlaceholder } from "@/components/ui/Media";
import { Price } from "@/components/ui/Price";
import { CurrencySwitcher } from "@/components/ui/CurrencySwitcher";
import { useCompare, useFavorites } from "@/lib/stores";
import { openLeadModal } from "@/lib/ui-store";
import type { AmenityKey, Property } from "@/lib/types";
import { slugOf, tr } from "@/lib/utils";

export function FavoritesView({ properties }: { properties: Property[] }) {
  const t = useTranslations("pages.favorites");
  const { items } = useFavorites();
  const list = items.map((id) => properties.find((p) => p.id === id)).filter((p): p is Property => Boolean(p));
  if (list.length === 0)
    return (
      <div className="rounded-[2rem] border border-dashed border-line bg-white p-10 text-center">
        <p className="mx-auto max-w-md text-stone">{t("empty")}</p>
        <Link href="/properties" className="btn btn-navy mt-6">
          {t("browse")}
        </Link>
      </div>
    );
  return (
    <>
      <div className="mb-6 flex flex-wrap gap-3">
        <Link href="/compare" className="btn btn-ghost btn-sm">
          {t("compare")}
        </Link>
        <button
          type="button"
          className="btn btn-gold btn-sm"
          onClick={() => openLeadModal({ type: "info", interest: list.map((p) => p.slug_es).join(", ").slice(0, 150) })}
        >
          {t("ask")}
        </button>
      </div>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <li key={p.id}>
            <PropertyCard property={p} />
          </li>
        ))}
      </ul>
    </>
  );
}

const COMPARE_AMENITIES: AmenityKey[] = ["pool", "sea_view", "gated", "furnished", "beach_access", "security", "gym", "golf"];

export function CompareView({ properties }: { properties: Property[] }) {
  const t = useTranslations("pages.compare");
  const tc = useTranslations("common");
  const locale = useLocale();
  const { items, toggle, clear } = useCompare();
  const list = items.map((id) => properties.find((p) => p.id === id)).filter((p): p is Property => Boolean(p));

  if (list.length === 0)
    return (
      <div className="rounded-[2rem] border border-dashed border-line bg-white p-10 text-center">
        <p className="mx-auto max-w-md text-stone">{t("empty")}</p>
        <Link href="/properties" className="btn btn-navy mt-6">
          {t("browse")}
        </Link>
      </div>
    );

  const rows: { label: string; render: (p: Property) => React.ReactNode }[] = [
    { label: tc("specs.price"), render: (p) => <Price usd={p.price} className="font-display text-2xl" /> },
    { label: t("pricePerM2"), render: (p) => (p.price && (p.built_m2 || p.lot_m2) ? <Price usd={Math.round(p.price / (p.built_m2 || p.lot_m2))} /> : <Minus className="size-4 text-stone" />) },
    { label: tc("specs.type"), render: (p) => tc(`types.${p.type}`) },
    { label: tc("specs.zone"), render: (p) => p.zone },
    { label: tc("specs.status"), render: (p) => tc(`status.${p.status}`) },
    { label: tc("specs.bedroomsShort"), render: (p) => p.bedrooms || "—" },
    { label: tc("specs.bathroomsShort"), render: (p) => p.bathrooms || "—" },
    { label: tc("specs.built"), render: (p) => (p.built_m2 ? `${p.built_m2} m²` : "—") },
    { label: tc("specs.lot"), render: (p) => (p.lot_m2 ? `${p.lot_m2} m²` : "—") },
    ...COMPARE_AMENITIES.map((a) => ({
      label: tc(`amenities.${a}`),
      render: (p: Property) => (p.amenities.includes(a) ? <Check className="size-5 text-available" aria-label="✓" /> : <Minus className="size-4 text-stone-light" aria-label="—" />),
    })),
  ];

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <CurrencySwitcher />
        <button type="button" onClick={clear} className="btn btn-ghost btn-sm">
          {t("clear")}
        </button>
      </div>
      <div className="overflow-x-auto rounded-[1.75rem] border border-line bg-white" data-lenis-prevent>
        <table className="w-full min-w-[640px] text-sm">
          <caption className="sr-only">{t("title")}</caption>
          <thead>
            <tr>
              <th scope="col" className="w-40 p-4 text-left text-xs tracking-wider text-stone uppercase">
                {t("feature")}
              </th>
              {list.map((p) => (
                <th key={p.id} scope="col" className="p-4 text-left align-top font-normal">
                  <div className="relative">
                    <ImagePlaceholder ratio="4/3" className="rounded-2xl" compact />
                    <button type="button" onClick={() => toggle(p.id)} aria-label={t("remove")} className="absolute top-2 right-2 grid size-8 place-items-center rounded-full bg-white shadow">
                      <X className="size-4" />
                    </button>
                  </div>
                  <Link href={{ pathname: "/properties/[slug]", params: { slug: slugOf(p, locale) } }} className="mt-3 block font-bold hover:text-gold-dark">
                    {tr(p.title, locale)}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-t border-line">
                <th scope="row" className="p-4 text-left text-xs font-semibold text-stone">
                  {r.label}
                </th>
                {list.map((p) => (
                  <td key={p.id} className="p-4 font-semibold">
                    {r.render(p)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
