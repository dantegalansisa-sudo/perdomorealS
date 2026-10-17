"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useTranslations } from "next-intl";
import { ArrowRight, Dumbbell, Laptop, MapPin, Plane, ShieldCheck, Trees, Umbrella, Waves } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { IsoVilla } from "@/components/ui/IsoVilla";
import { PlaceholderBadge } from "@/components/ui/PlaceholderBadge";
import { Price } from "@/components/ui/Price";
import type { UnitStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STEPS = ["location", "villa", "amenities", "availability"] as const;
const STATUS_COLOR: Record<UnitStatus, string> = { available: "bg-available", reserved: "bg-reserved", sold: "bg-sold" };

type Props = {
  priceFrom: number | null;
  statuses: UnitStatus[];
  isPlaceholder: boolean;
};

function Visual({ step, statuses }: { step: number; statuses: UnitStatus[] }) {
  const tu = useTranslations("common.unitStatus");
  const tl = useTranslations("home.location.points");
  if (step === 0)
    return (
      <div className="relative aspect-square w-full overflow-hidden rounded-[2rem] bg-[#e8eef0]">
        {/* stylised coastline map */}
        <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" aria-hidden>
          <path d="M0 0h400v400H0z" fill="#dfe9ec" />
          <path d="M0 0h270c-20 40-6 70 10 100s30 70 10 110-10 80 30 120 70 70 80 70H0z" fill="#f4efe6" />
          <path d="M270 0c-20 40-6 70 10 100s30 70 10 110-10 80 30 120 70 70 80 70" fill="none" stroke="#c9a961" strokeWidth="2" strokeDasharray="4 6" />
          <path d="M40 360 C120 300 180 260 230 150 S260 60 250 20" fill="none" stroke="#0b1f3a" strokeOpacity="0.25" strokeWidth="5" strokeLinecap="round" />
        </svg>
        {[
          { x: "58%", y: "22%", label: tl("macao"), main: true },
          { x: "47%", y: "52%", label: tl("bavaro") },
          { x: "66%", y: "86%", label: tl("airport") },
        ].map((p) => (
          <div key={p.label} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: p.x, top: p.y }}>
            <span className={cn("flex items-center gap-1.5 max-w-[9.5rem] rounded-full px-3 py-1.5 text-center text-[11px] leading-tight font-bold shadow-lg sm:max-w-none sm:text-xs sm:whitespace-nowrap", p.main ? "bg-navy text-white" : "bg-white text-navy")}>
              {p.main ? <MapPin className="size-3.5 text-gold" /> : <Plane className="size-3.5 text-gold-dark" />}
              {p.label}
            </span>
          </div>
        ))}
        <span className="absolute top-[30%] left-[58%] size-24 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-gold/20" aria-hidden />
      </div>
    );
  if (step === 1)
    return (
      <div className="relative grid aspect-square w-full place-items-center rounded-[2rem] bg-gradient-to-br from-white to-sand-2">
        <IsoVilla className="w-[92%]" />
      </div>
    );
  if (step === 2) {
    const items = [
      { icon: Waves, k: "pool" },
      { icon: Dumbbell, k: "gym" },
      { icon: Laptop, k: "coworking" },
      { icon: ShieldCheck, k: "security" },
      { icon: Trees, k: "garden" },
      { icon: Umbrella, k: "beach_access" },
    ] as const;
    return <AmenityGrid items={items} />;
  }
  const counts = statuses.reduce((acc, s) => ((acc[s] = (acc[s] ?? 0) + 1), acc), {} as Record<UnitStatus, number>);
  return (
    <div className="aspect-square w-full rounded-[2rem] bg-white p-5 sm:p-7">
      <div className="grid grid-cols-10 gap-1.5 sm:gap-2" aria-hidden>
        {statuses.map((s, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.008, duration: 0.3 }}
            className={cn("aspect-square rounded-[4px]", STATUS_COLOR[s])}
          />
        ))}
      </div>
      <ul className="mt-5 flex flex-wrap gap-4 text-xs font-semibold text-navy-soft">
        {(["available", "reserved", "sold"] as UnitStatus[]).map((s) => (
          <li key={s} className="flex items-center gap-1.5">
            <span className={cn("size-2.5 rounded-full", STATUS_COLOR[s])} />
            {tu(s)} · {counts[s] ?? 0}
          </li>
        ))}
      </ul>
    </div>
  );
}

function AmenityGrid({ items }: { items: readonly { icon: React.ComponentType<{ className?: string }>; k: string }[] }) {
  const ta = useTranslations("common.amenities");
  return (
    <div className="grid aspect-square w-full grid-cols-2 gap-3 rounded-[2rem] bg-navy p-4 sm:grid-cols-3 sm:p-6">
      {items.map(({ icon: Icon, k }, i) => (
        <motion.div
          key={k}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className="flex flex-col items-start justify-between rounded-2xl bg-white/[0.06] p-4 text-white"
        >
          <Icon className="size-6 text-gold" />
          <span className="text-sm font-semibold">{ta(k as never)}</span>
        </motion.div>
      ))}
    </div>
  );
}

function ProgressSegment({ progress, index }: { progress: MotionValue<number>; index: number }) {
  const scaleX = useTransform(progress, [index / STEPS.length, (index + 1) / STEPS.length], [0, 1]);
  return (
    <span className="h-1 flex-1 overflow-hidden rounded-full bg-line">
      <motion.span className="block h-full origin-left bg-gold" style={{ scaleX }} />
    </span>
  );
}

function StepText({ step, available }: { step: number; available: number }) {
  const t = useTranslations("home.featured.steps");
  const key = STEPS[step];
  return (
    <motion.div key={key} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
      <p className="mb-2 text-sm font-bold text-gold-dark sm:mb-3">
        0{step + 1} — {t(`${key}.label`)}
      </p>
      <h3 className="text-3xl text-navy sm:text-5xl">{t(`${key}.title`, { available })}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-stone sm:mt-4 sm:text-base">{t(`${key}.text`)}</p>
    </motion.div>
  );
}

export function FeaturedProject({ priceFrom, statuses, isPlaceholder }: Props) {
  const t = useTranslations("home.featured");
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const available = statuses.filter((s) => s === "available").length;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const progress = useTransform(scrollYProgress, [0, 1], [0, 1]);
  useMotionValueEvent(scrollYProgress, "change", (v) => setStep(Math.min(STEPS.length - 1, Math.floor(v * STEPS.length))));

  const header = (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="eyebrow mb-2 flex items-center gap-3 sm:mb-3">
          <span className="h-px w-8 bg-gold" aria-hidden />
          {t("eyebrow")}
        </p>
        <h2 className="text-[2.5rem] text-navy sm:text-6xl lg:text-7xl">{t("title")}</h2>
        <div className="mt-2 flex flex-wrap items-center gap-3 sm:mt-3">
          {priceFrom && <Price usd={priceFrom} from className="font-display text-2xl text-gold-dark" />}
          <PlaceholderBadge show={isPlaceholder} />
        </div>
      </div>
      <Link href="/villas-macao" className="btn btn-navy btn-sm sm:px-6 sm:py-3.5 sm:text-sm">
        {t("cta")}
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </div>
  );

  // Reduced motion: no pinning — simple stacked steps.
  if (reduce) {
    return (
      <section className="container-x py-24">
        {header}
        <div className="mt-12 grid gap-12">
          {STEPS.map((_, i) => (
            <div key={i} className="grid items-center gap-8 lg:grid-cols-2">
              <StepText step={i} available={available} />
              <Visual step={i} statuses={statuses} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative h-[340vh] lg:h-[400vh]" aria-label={t("title")}>
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden pt-16 pb-24 sm:py-20 lg:py-24">
        <div className="container-x">
          {header}
          <div className="mt-4 grid items-center gap-4 sm:mt-10 sm:gap-6 lg:grid-cols-[1fr_1fr] lg:gap-16">
            <div className="order-2 min-h-[9.5rem] lg:order-1 lg:min-h-[16rem]">
              <AnimatePresence mode="wait">
                <StepText step={step} available={available} />
              </AnimatePresence>
              {/* progress rail */}
              <div className="mt-6 flex gap-2 lg:mt-10" aria-hidden>
                {STEPS.map((s, i) => (
                  <ProgressSegment key={s} progress={progress} index={i} />
                ))}
              </div>
            </div>
            <div className="order-1 mx-auto w-full max-w-[min(100%,34svh)] lg:order-2 lg:max-w-[520px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, scale: 0.94, rotate: -1 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 1.03 }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Visual step={step} statuses={statuses} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
