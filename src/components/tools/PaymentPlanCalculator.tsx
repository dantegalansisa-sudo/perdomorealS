"use client";
import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { PaymentPlan } from "@/lib/types";
import { cn, tr } from "@/lib/utils";
import { clamp, moneyStep, ResultRow, SliderField, useMoney } from "./shared";

const COLORS = { down: "#0b1f3a", during: "#c9a961", delivery: "#cdbd9c" };
const CUSTOM = "custom";

/**
 * Payment plan calculator: choose a developer plan (or a custom split), adjust the price and see
 * the amount of each stage, the monthly installment during construction and a stacked bar.
 */
export function PaymentPlanCalculator({ price, plans, compact = false }: { price: number; plans: PaymentPlan[]; compact?: boolean }) {
  const t = useTranslations("tools.payment");
  const locale = useLocale();
  const m = useMoney();

  const list = useMemo<PaymentPlan[]>(
    () =>
      plans.length
        ? plans
        : [{ id: "default-30-40-30", name: { es: t("defaultPlan"), en: t("defaultPlan") }, down: 30, during: 40, delivery: 30, installments: 18 }],
    [plans, t]
  );
  const basePrice = price > 0 ? price : 250000;
  const [planId, setPlanId] = useState(list[0].id);
  const [amount, setAmount] = useState(basePrice);
  const [custom, setCustom] = useState({ down: list[0].down, during: list[0].during, installments: list[0].installments || 12 });

  useEffect(() => setAmount(basePrice), [basePrice]);
  useEffect(() => {
    if (planId !== CUSTOM && !list.some((p) => p.id === planId)) setPlanId(list[0].id);
  }, [list, planId]);

  const isCustom = planId === CUSTOM;
  const selected = list.find((p) => p.id === planId) ?? list[0];
  const plan = isCustom
    ? { down: custom.down, during: custom.during, delivery: 100 - custom.down - custom.during, installments: custom.during > 0 ? custom.installments : 0 }
    : { down: selected.down, during: selected.during, delivery: selected.delivery, installments: selected.installments };

  const downAmt = (amount * plan.down) / 100;
  const duringAmt = (amount * plan.during) / 100;
  const deliveryAmt = (amount * plan.delivery) / 100;
  const monthly = plan.installments > 0 ? duringAmt / plan.installments : 0;

  const minPrice = Math.round(m.toLocal(Math.max(25000, basePrice * 0.4)));
  const maxPrice = Math.round(m.toLocal(Math.max(basePrice * 2.5, 500000)));

  const selectPlan = (id: string) => {
    if (id === CUSTOM && !isCustom) setCustom({ down: plan.down, during: plan.during, installments: plan.installments || 12 });
    setPlanId(id);
  };

  const segments = [
    { key: "down", pct: plan.down, label: t("down"), amount: downAmt, color: COLORS.down },
    { key: "during", pct: plan.during, label: t("during"), amount: duringAmt, color: COLORS.during },
    { key: "delivery", pct: plan.delivery, label: t("delivery"), amount: deliveryAmt, color: COLORS.delivery },
  ];

  const planChips = (
    <div role="radiogroup" aria-label={t("plan")} className="flex flex-wrap gap-2">
      {list.map((p) => (
        <button key={p.id} type="button" role="radio" aria-checked={planId === p.id} data-active={planId === p.id} onClick={() => selectPlan(p.id)} className="chip">
          {tr(p.name, locale)}
          <span className="text-[10px] font-bold text-stone tabular-nums">
            {p.down}/{p.during}/{p.delivery}
          </span>
        </button>
      ))}
      {!compact && (
        <button type="button" role="radio" aria-checked={isCustom} data-active={isCustom} onClick={() => selectPlan(CUSTOM)} className="chip">
          {t("custom")}
        </button>
      )}
    </div>
  );

  const bar = (
    <div>
      <p className="mb-2 text-xs font-bold tracking-[0.18em] text-stone uppercase">{t("breakdown")}</p>
      <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-sand-2" role="img" aria-label={segments.map((s) => `${s.label} ${s.pct}%`).join(", ")}>
        {segments.map((s) =>
          s.pct > 0 ? (
            <div key={s.key} className="h-full transition-[width] duration-500 ease-out first:rounded-l-full last:rounded-r-full" style={{ width: `${s.pct}%`, background: s.color }} />
          ) : null
        )}
      </div>
      <div className="mt-2 flex justify-between text-[11px] font-bold text-stone tabular-nums">
        {segments.map((s) => (
          <span key={s.key}>{s.pct}%</span>
        ))}
      </div>
    </div>
  );

  const results = (
    <div className={cn(compact ? "border-t border-line pt-6" : "rounded-3xl border border-line bg-white p-5 sm:p-6")}>
      {bar}
      <dl className="mt-4 divide-y divide-line">
        <ResultRow label={`${t("down")} · ${plan.down}%`} value={m.fmt(downAmt)} dot={COLORS.down} />
        <ResultRow label={`${t("during")} · ${plan.during}%`} value={m.fmt(duringAmt)} dot={COLORS.during} />
        <ResultRow label={`${t("delivery")} · ${plan.delivery}%`} value={m.fmt(deliveryAmt)} dot={COLORS.delivery} />
        {!compact && <ResultRow label={t("total")} value={m.fmt(amount)} />}
      </dl>
      <div className="mt-4 rounded-2xl bg-navy p-4 text-white sm:p-5">
        <p className="text-xs font-bold tracking-[0.18em] text-gold uppercase">{t("monthly")}</p>
        {plan.during === 0 ? (
          <p className="mt-1 text-base font-bold">{t("noMonthly")}</p>
        ) : plan.installments > 0 ? (
          <p className="mt-1 flex flex-wrap items-baseline gap-x-2">
            <span className="font-display text-4xl tracking-wide tabular-nums">{m.fmt(monthly)}</span>
            <span className="text-sm text-white/70">× {t("installmentsCount", { count: plan.installments })}</span>
          </p>
        ) : (
          <p className="mt-1 flex flex-wrap items-baseline gap-x-2">
            <span className="font-display text-4xl tracking-wide tabular-nums">{m.fmt(duringAmt)}</span>
            <span className="text-sm text-white/70">{t("singlePayment")}</span>
          </p>
        )}
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-stone">{t("disclaimer")}</p>
    </div>
  );

  if (compact) {
    return (
      <div className="space-y-6 rounded-[2rem] border border-line bg-white p-5 shadow-[0_30px_60px_-40px_rgba(11,31,58,0.35)] sm:p-8">
        {planChips}
        <SliderField
          label={t("price")}
          value={Math.round(m.toLocal(amount))}
          onChange={(v) => setAmount(m.fromLocal(v))}
          min={minPrice}
          max={maxPrice}
          step={moneyStep(m.rate)}
          suffix={m.currency}
        />
        {results}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10">
      <div className="min-w-0 space-y-6">
        <div>
          <p className="label">{t("plan")}</p>
          {planChips}
        </div>
        <SliderField
          label={t("price")}
          value={Math.round(m.toLocal(amount))}
          onChange={(v) => setAmount(m.fromLocal(v))}
          min={minPrice}
          max={maxPrice}
          step={moneyStep(m.rate)}
          suffix={m.currency}
        />
        {isCustom ? (
          <div className="space-y-5 rounded-3xl border border-dashed border-gold/50 bg-gold-soft/20 p-4 sm:p-5">
            <SliderField
              label={t("down")}
              value={custom.down}
              suffix="%"
              min={0}
              max={100}
              onChange={(v) => setCustom((c) => ({ ...c, down: v, during: Math.min(c.during, 100 - v) }))}
            />
            <SliderField
              label={t("during")}
              value={custom.during}
              suffix="%"
              min={0}
              max={100 - custom.down}
              onChange={(v) => setCustom((c) => ({ ...c, during: clamp(v, 0, 100 - c.down) }))}
            />
            <SliderField
              label={t("installments")}
              value={custom.installments}
              min={1}
              max={60}
              onChange={(v) => setCustom((c) => ({ ...c, installments: Math.round(v) }))}
            />
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-navy-soft">{t("delivery")}</span>
              <span className="font-extrabold text-navy tabular-nums">{plan.delivery}%</span>
            </div>
          </div>
        ) : (
          <dl className="grid grid-cols-3 gap-2 text-center">
            {segments.map((s) => (
              <div key={s.key} className="rounded-2xl border border-line bg-white px-2 py-3">
                <dt className="text-[10px] leading-tight font-bold tracking-wide text-stone uppercase">{s.label}</dt>
                <dd className="mt-1 font-display text-2xl text-navy">{s.pct}%</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      {results}
    </div>
  );
}
