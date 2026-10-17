"use client";
import { motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { Check, Clock, Hammer } from "lucide-react";
import { Counter } from "@/components/motion/Counter";
import { formatDate } from "@/lib/format";
import type { TimelineStep } from "@/lib/types";
import { cn, tr } from "@/lib/utils";

/** Scroll-triggered scaleX fill; static when reduced motion is requested. */
const fill = (pct: number, reduce: boolean | null) =>
  reduce
    ? { initial: false as const, animate: { scaleX: pct / 100 } }
    : { initial: { scaleX: 0 }, whileInView: { scaleX: pct / 100 }, viewport: { once: true, amount: 0.6 } };

/** Construction phases with progress bars that fill on scroll (scaleX only). */
export function ConstructionTimeline({ steps }: { steps: TimelineStep[] }) {
  const t = useTranslations("project.timeline");
  const locale = useLocale();
  const reduce = useReducedMotion();
  const overall = steps.length ? Math.round(steps.reduce((a, s) => a + s.progress, 0) / steps.length) : 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-12">
      <div className="rounded-3xl bg-navy p-6 text-white sm:p-8">
        <p className="text-xs font-bold tracking-[0.18em] text-gold uppercase">{t("overall")}</p>
        <p className="mt-2 font-display text-7xl tracking-wide">
          <Counter to={overall} suffix="%" locale={locale} />
        </p>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/15">
          <motion.div
            className="h-full origin-left rounded-full bg-gold"
            {...fill(overall, reduce)}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>
      <ol className="relative space-y-3">
        {steps.map((s, i) => {
          const state = s.progress >= 100 ? "completed" : s.progress > 0 ? "inProgress" : "upcoming";
          const Icon = state === "completed" ? Check : state === "inProgress" ? Hammer : Clock;
          return (
            <li key={i} className="rounded-3xl border border-line bg-white p-5">
              <div className="flex items-start gap-4">
                <span
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-full",
                    state === "completed" ? "bg-available text-white" : state === "inProgress" ? "bg-gold text-navy" : "bg-sand-2 text-stone"
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <p className="font-bold text-navy">{tr(s.phase, locale)}</p>
                    <p className="text-xs font-bold tracking-wide text-stone uppercase">
                      {formatDate(s.date, locale, { month: "short", year: "numeric", timeZone: "UTC" })}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <div
                      className="h-1.5 flex-1 overflow-hidden rounded-full bg-sand-2"
                      role="progressbar"
                      aria-valuenow={s.progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={tr(s.phase, locale)}
                    >
                      <motion.div
                        className={cn("h-full origin-left rounded-full", state === "completed" ? "bg-available" : "bg-gold")}
                        {...fill(s.progress, reduce)}
                        transition={{ duration: 1.1, delay: 0.1 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                    <span className="w-28 shrink-0 text-right text-xs font-bold text-navy-soft tabular-nums">
                      {state === "upcoming" ? t("upcoming") : state === "completed" ? t("completed") : t("progress", { value: s.progress })}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
