"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { LayoutGrid, List, Map as MapIcon, SlidersHorizontal, X } from "lucide-react";
import { PropertyCard } from "@/components/property/PropertyCard";
import { LazyMap } from "@/components/map/LazyMap";
import { CurrencySwitcher } from "@/components/ui/CurrencySwitcher";
import { useSite } from "@/components/providers/SiteProvider";
import { formatPrice } from "@/lib/format";
import { openLeadModal } from "@/lib/ui-store";
import { activeFilterCount, ALL_STATUS, ALL_TYPES, applyFilters, FILTER_AMENITIES, parseFilters, toQueryString, type Filters, type SortKey, type ViewKey } from "@/lib/search";
import type { Property, PropertyType } from "@/lib/types";
import { cn, slugOf, tr } from "@/lib/utils";
import { RecentlyViewed } from "./RecentlyViewed";

const PRICE_STEPS = [0, 100000, 150000, 200000, 250000, 300000, 400000, 500000, 750000, 1000000, 1500000, 2000000];

type Props = { properties: Property[]; projects: { id: string; name: string }[]; lockedType?: PropertyType };

export function PropertySearch({ properties, projects, lockedType }: Props) {
  const t = useTranslations("search");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const { currency, rates } = useSite();
  const [sheet, setSheet] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  const filters = useMemo(() => {
    const f = parseFilters(new URLSearchParams(sp.toString()));
    if (lockedType) f.type = [lockedType];
    return f;
  }, [sp, lockedType]);

  const projectNames = useMemo(() => Object.fromEntries(projects.map((p) => [p.id, p.name])), [projects]);
  const results = useMemo(() => applyFilters(properties, filters, projectNames), [properties, filters, projectNames]);
  const zones = useMemo(() => [...new Set(properties.map((p) => p.zone))].sort(), [properties]);
  const count = activeFilterCount(filters, lockedType);

  const update = (patch: Partial<Filters>) => {
    const qs = toQueryString({ ...filters, ...patch }, lockedType);
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };
  const toggleIn = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const clear = () => router.replace(filters.view !== "grid" ? `${pathname}?view=${filters.view}` : pathname, { scroll: false });

  useEffect(() => {
    document.documentElement.style.overflow = sheet ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [sheet]);

  const priceLabel = (v: number) => formatPrice(v, currency, rates, locale, true) ?? "";
  const priceIdx = (v: number | null, fallback: number) => (v == null ? fallback : Math.max(0, PRICE_STEPS.findIndex((s) => s >= v)));

  const renderPanel = (px: string) => (
    <div className="space-y-7">
      <div>
        <label htmlFor={px + "-q"} className="label">
          {t("keyword")}
        </label>
        <input id={px + "-q"} defaultValue={filters.q} placeholder={t("keywordPlaceholder")} className="field" onChange={(e) => update({ q: e.target.value })} />
      </div>

      {!lockedType && (
        <fieldset>
          <legend className="label">{t("type")}</legend>
          <div className="flex flex-wrap gap-2">
            {ALL_TYPES.map((ty) => (
              <button key={ty} type="button" className="chip" data-active={filters.type.includes(ty)} aria-pressed={filters.type.includes(ty)} onClick={() => update({ type: toggleIn(filters.type, ty) })}>
                {tc(`types.${ty}`)}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset>
        <legend className="label">{t("zone")}</legend>
        <div className="flex flex-wrap gap-2">
          {zones.map((z) => (
            <button key={z} type="button" className="chip" data-active={filters.zone.includes(z)} aria-pressed={filters.zone.includes(z)} onClick={() => update({ zone: toggleIn(filters.zone, z) })}>
              {z}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="label">{t("price")}</legend>
        <div className="mb-2 flex justify-between text-sm font-semibold">
          <span>{priceLabel(filters.minPrice ?? 0)}</span>
          <span>{filters.maxPrice == null ? `${priceLabel(PRICE_STEPS.at(-1)!)}+` : priceLabel(filters.maxPrice)}</span>
        </div>
        <div className="grid gap-3">
          <label className="sr-only" htmlFor={px + "-minp"}>
            {t("min")}
          </label>
          <input
            id={px + "-minp"}
            type="range"
            className="range"
            min={0}
            max={PRICE_STEPS.length - 1}
            value={priceIdx(filters.minPrice, 0)}
            onChange={(e) => {
              const i = Number(e.target.value);
              const maxI = priceIdx(filters.maxPrice, PRICE_STEPS.length - 1);
              update({ minPrice: i === 0 ? null : PRICE_STEPS[Math.min(i, maxI)] });
            }}
          />
          <label className="sr-only" htmlFor={px + "-maxp"}>
            {t("max")}
          </label>
          <input
            id={px + "-maxp"}
            type="range"
            className="range"
            min={0}
            max={PRICE_STEPS.length - 1}
            value={priceIdx(filters.maxPrice, PRICE_STEPS.length - 1)}
            onChange={(e) => {
              const i = Number(e.target.value);
              const minI = priceIdx(filters.minPrice, 0);
              update({ maxPrice: i === PRICE_STEPS.length - 1 ? null : PRICE_STEPS[Math.max(i, minI)] });
            }}
          />
        </div>
      </fieldset>

      {lockedType !== "land" && (
        <div className="grid grid-cols-2 gap-4">
          {(["beds", "baths"] as const).map((k) => (
            <div key={k}>
              <label htmlFor={`${px}-${k}`} className="label">
                {k === "beds" ? t("bedrooms") : t("bathrooms")}
              </label>
              <select id={`${px}-${k}`} className="field" value={filters[k] ?? ""} onChange={(e) => update({ [k]: e.target.value ? Number(e.target.value) : null })}>
                <option value="">{t("any")}</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}+
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {(
        [
          { label: t("built"), min: "minBuilt", max: "maxBuilt", hide: lockedType === "land" },
          { label: t("lot"), min: "minLot", max: "maxLot", hide: lockedType === "apartment" },
        ] as const
      )
        .filter((r) => !r.hide)
        .map((r) => (
          <fieldset key={r.min}>
            <legend className="label">{r.label}</legend>
            <div className="grid grid-cols-2 gap-3">
              <input type="number" inputMode="numeric" min={0} aria-label={`${r.label} ${t("min")}`} placeholder={t("min")} defaultValue={filters[r.min] ?? ""} className="field" onChange={(e) => update({ [r.min]: e.target.value ? Number(e.target.value) : null })} />
              <input type="number" inputMode="numeric" min={0} aria-label={`${r.label} ${t("max")}`} placeholder={t("max")} defaultValue={filters[r.max] ?? ""} className="field" onChange={(e) => update({ [r.max]: e.target.value ? Number(e.target.value) : null })} />
            </div>
          </fieldset>
        ))}

      <fieldset>
        <legend className="label">{t("status")}</legend>
        <div className="flex flex-wrap gap-2">
          {ALL_STATUS.map((s) => (
            <button key={s} type="button" className="chip" data-active={filters.status.includes(s)} aria-pressed={filters.status.includes(s)} onClick={() => update({ status: toggleIn(filters.status, s) })}>
              {tc(`status.${s}`)}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="label">{t("amenities")}</legend>
        <div className="grid grid-cols-2 gap-2">
          {FILTER_AMENITIES.map((a) => (
            <label key={a} className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" className="size-4 accent-[#0B1F3A]" checked={filters.amen.includes(a)} onChange={() => update({ amen: toggleIn(filters.amen, a) })} />
              {tc(`amenities.${a}`)}
            </label>
          ))}
        </div>
      </fieldset>

      {projects.length > 0 && (
        <div>
          <label htmlFor={px + "-project"} className="label">
            {t("project")}
          </label>
          <select id={px + "-project"} className="field" value={filters.project} onChange={(e) => update({ project: e.target.value })}>
            <option value="">{t("anyProject")}</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {count > 0 && (
        <button type="button" onClick={clear} className="text-sm font-bold text-gold-dark underline underline-offset-4">
          {t("clear")}
        </button>
      )}
    </div>
  );

  const markers = results.map((p) => ({
    id: p.id,
    lat: p.lat,
    lng: p.lng,
    label: p.price ? (formatPrice(p.price, currency, rates, locale, true) ?? "") : tc(`types.${p.type}`),
    popup: tr(p.title, locale),
    href: `/${locale}/${locale === "es" ? "propiedades" : "properties"}/${slugOf(p, locale)}`,
  }));

  const views: { k: ViewKey; icon: typeof LayoutGrid }[] = [
    { k: "grid", icon: LayoutGrid },
    { k: "list", icon: List },
    { k: "map", icon: MapIcon },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block" aria-label={t("filters")}>
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-[1.75rem] border border-line bg-white p-6" data-lenis-prevent>
          <p className="font-display mb-6 text-3xl">{t("filters")}</p>
          {renderPanel("fd")}
        </div>
      </aside>

      <div className="min-w-0">
        {/* Toolbar */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => setSheet(true)} className="btn btn-navy btn-sm lg:hidden">
            <SlidersHorizontal className="size-4" aria-hidden />
            {t("showFilters")}
            {count > 0 && <span className="grid size-5 place-items-center rounded-full bg-gold text-[10px] text-navy">{count}</span>}
          </button>
          <p className="mr-auto text-sm font-semibold text-navy-soft" aria-live="polite">
            {t("results", { count: results.length })}
          </p>
          <CurrencySwitcher />
          <label htmlFor="f-sort" className="sr-only">
            {t("sort")}
          </label>
          <select id="f-sort" value={filters.sort} onChange={(e) => update({ sort: e.target.value as SortKey })} className="field w-auto rounded-full py-2 text-sm">
            {(["newest", "price_asc", "price_desc", "area_desc"] as SortKey[]).map((s) => (
              <option key={s} value={s}>
                {t(`sorts.${s}`)}
              </option>
            ))}
          </select>
          <div role="group" aria-label="View" className="inline-flex rounded-full border border-line bg-white p-0.5">
            {views.map(({ k, icon: Icon }) => (
              <button
                key={k}
                type="button"
                aria-pressed={filters.view === k}
                aria-label={t(`views.${k}`)}
                title={t(`views.${k}`)}
                onClick={() => update({ view: k })}
                className={cn("grid size-9 place-items-center rounded-full transition-colors", filters.view === k ? "bg-navy text-white" : "text-navy-soft hover:text-navy")}
              >
                <Icon className="size-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Active filter chips */}
        {count > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {!lockedType &&
              filters.type.map((ty) => (
                <button key={ty} type="button" className="chip" data-active onClick={() => update({ type: filters.type.filter((x) => x !== ty) })}>
                  {tc(`types.${ty}`)} <X className="size-3" aria-hidden />
                </button>
              ))}
            {filters.zone.map((z) => (
              <button key={z} type="button" className="chip" data-active onClick={() => update({ zone: filters.zone.filter((x) => x !== z) })}>
                {z} <X className="size-3" aria-hidden />
              </button>
            ))}
            {filters.amen.map((a) => (
              <button key={a} type="button" className="chip" data-active onClick={() => update({ amen: filters.amen.filter((x) => x !== a) })}>
                {tc(`amenities.${a}`)} <X className="size-3" aria-hidden />
              </button>
            ))}
            {filters.status.map((s) => (
              <button key={s} type="button" className="chip" data-active onClick={() => update({ status: filters.status.filter((x) => x !== s) })}>
                {tc(`status.${s}`)} <X className="size-3" aria-hidden />
              </button>
            ))}
            <button type="button" onClick={clear} className="px-2 text-xs font-bold text-gold-dark underline underline-offset-4">
              {t("clear")}
            </button>
          </div>
        )}

        {results.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-line bg-white p-10 text-center">
            <p className="font-display text-3xl">{t("empty")}</p>
            <button type="button" onClick={() => openLeadModal({ type: "info" })} className="btn btn-gold mt-6">
              {t("emptyCta")}
            </button>
          </div>
        ) : filters.view === "map" ? (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <ul className="order-2 grid max-h-none gap-5 sm:grid-cols-2 xl:order-1 xl:max-h-[75vh] xl:grid-cols-1 xl:overflow-y-auto xl:pr-2" data-lenis-prevent>
              {results.map((p) => (
                <li key={p.id}>
                  <PropertyCard property={p} layout="list" active={hovered === p.id} onHover={setHovered} />
                </li>
              ))}
            </ul>
            <div className="order-1 h-[55vh] overflow-hidden rounded-[1.75rem] border border-line xl:sticky xl:top-24 xl:order-2 xl:h-[75vh]">
              <LazyMap markers={markers} activeId={hovered} onMarkerClick={setHovered} />
            </div>
          </div>
        ) : (
          <motion.ul layout className={cn("grid gap-5", filters.view === "grid" ? "sm:grid-cols-2 2xl:grid-cols-3" : "grid-cols-1")}>
            <AnimatePresence mode="popLayout">
              {results.map((p, i) => (
                <motion.li key={p.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.35 }}>
                  <PropertyCard property={p} layout={filters.view === "list" ? "list" : "grid"} priority={i < 2} />
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}

        <RecentlyViewed properties={properties} className="mt-16" />
      </div>

      {/* Mobile filter sheet */}
      <AnimatePresence>
        {sheet && (
          <motion.div className="fixed inset-0 z-[80] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button type="button" aria-label={tc("closeMenu")} className="absolute inset-0 bg-navy/45 backdrop-blur-sm" onClick={() => setSheet(false)} />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={t("filters")}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute inset-x-0 bottom-0 flex max-h-[90dvh] flex-col rounded-t-[2rem] bg-sand"
            >
              <div className="flex items-center justify-between border-b border-line p-5">
                <p className="font-display text-3xl">{t("filters")}</p>
                <button type="button" onClick={() => setSheet(false)} aria-label={tc("closeMenu")} className="grid size-10 place-items-center rounded-full bg-white">
                  <X className="size-4" />
                </button>
              </div>
              <div className="overflow-y-auto p-5" data-lenis-prevent>
                {renderPanel("fm")}
              </div>
              <div className="border-t border-line p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                <button type="button" onClick={() => setSheet(false)} className="btn btn-gold w-full">
                  {t("apply", { count: results.length })}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
