"use client";
import { useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { Bath, BedDouble, Check, Ruler, Trees } from "lucide-react";
import { ImagePlaceholder } from "@/components/ui/Media";
import { PlaceholderBadge } from "@/components/ui/PlaceholderBadge";
import { Price } from "@/components/ui/Price";
import { FloorplanViewer } from "@/components/tools/FloorplanViewer";
import { Gallery } from "@/components/tools/Gallery";
import { formatNumber } from "@/lib/format";
import type { Unit, VillaModel } from "@/lib/types";
import { openLeadModal } from "@/lib/ui-store";
import { cn, tr } from "@/lib/utils";

/** Villa models with accessible tabs: specs, from price, features, floor plan and gallery. */
export function ModelsTabs({ projectId, projectName, models, units }: { projectId: string; projectName: string; models: VillaModel[]; units: Unit[] }) {
  const t = useTranslations("project.models");
  const tc = useTranslations("common");
  const locale = useLocale();
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const base = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  if (models.length === 0) return null;
  const m = models[Math.min(active, models.length - 1)];
  const available = units.filter((u) => u.model_id === m.id && u.status === "available").length;
  const images = (m.media ?? []).filter((x) => x.kind === "image");
  const plans = (m.media ?? []).filter((x) => x.kind === "floorplan");

  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (i + (e.key === "ArrowRight" ? 1 : models.length - 1)) % models.length;
    setActive(next);
    refs.current[next]?.focus();
  };

  const specs = [
    { icon: BedDouble, label: tc("specs.bedrooms", { count: m.bedrooms }) },
    { icon: Bath, label: tc("specs.bathrooms", { count: m.bathrooms }) },
    { icon: Ruler, label: `${formatNumber(m.built_m2, locale)} ${tc("specs.m2")} · ${tc("specs.built")}` },
    { icon: Trees, label: `${formatNumber(m.lot_m2, locale)} ${tc("specs.m2")} · ${tc("specs.lot")}` },
  ];

  return (
    <div>
      <div role="tablist" aria-label={t("tabsLabel")} className="no-scrollbar -mx-1 mb-8 flex gap-2 overflow-x-auto px-1 pb-1">
        {models.map((x, i) => (
          <button
            key={x.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${base}-tab-${i}`}
            aria-selected={i === active}
            aria-controls={`${base}-panel`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={(e) => onKey(e, i)}
            className={cn(
              "flex min-w-[8.5rem] shrink-0 flex-col items-start rounded-2xl border px-5 py-3 text-left transition-colors",
              i === active ? "border-navy bg-navy text-white" : "border-line bg-white text-navy hover:border-gold"
            )}
          >
            <span className="font-display text-2xl tracking-wide">{x.name}</span>
            <span className={cn("text-xs font-semibold", i === active ? "text-gold" : "text-stone")}>{tc("specs.bedrooms", { count: x.bedrooms })}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={m.id}
          role="tabpanel"
          id={`${base}-panel`}
          aria-labelledby={`${base}-tab-${active}`}
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35 }}
        >
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            <div>
              <p className="eyebrow mb-3">{t("floorplan")}</p>
              <FloorplanViewer plans={plans} title={`${projectName} — ${m.name}`} />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-5xl text-navy sm:text-6xl">{m.name}</h3>
                <PlaceholderBadge show={m.is_placeholder} />
              </div>
              <p className="mt-3 text-sm font-bold text-available">{t("availableUnits", { count: available })}</p>
              <p className="mt-5 text-xs font-bold tracking-[0.18em] text-stone uppercase">{t("fromPrice")}</p>
              <Price usd={m.price_from} className="font-display text-4xl tracking-wide text-navy sm:text-5xl" />
              <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {specs.map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-center gap-2.5 rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-navy">
                    <Icon className="size-4 shrink-0 text-gold-dark" aria-hidden />
                    {label}
                  </li>
                ))}
              </ul>
              <p className="mt-6 leading-relaxed text-stone">{tr(m.description, locale)}</p>
              {m.features.length > 0 && (
                <>
                  <p className="mt-6 text-xs font-bold tracking-[0.18em] text-navy uppercase">{t("features")}</p>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {m.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-navy-soft">
                        <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-gold-soft text-gold-dark">
                          <Check className="size-3" aria-hidden />
                        </span>
                        {tr(f, locale)}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <button
                type="button"
                onClick={() => openLeadModal({ type: "price", projectId, interest: `${projectName} — ${m.name}` })}
                className="btn btn-gold mt-8 w-full whitespace-normal text-center sm:w-auto"
              >
                {t("cta", { name: m.name })}
              </button>
            </div>
          </div>

          <div className="mt-10">
            {images.length > 0 ? (
              <Gallery media={images} title={`${projectName} — ${m.name}`} />
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {[t("interiors"), t("exteriors")].map((label) => (
                  <div key={label}>
                    <p className="eyebrow mb-3">{label}</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[0, 1, 2].map((i) => (
                        <ImagePlaceholder key={i} ratio="4/3" compact className="rounded-2xl" label={`${label} — ${m.name}`} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
