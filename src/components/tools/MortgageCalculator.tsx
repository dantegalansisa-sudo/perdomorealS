"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { moneyStep, ResultRow, SliderField, useMoney } from "./shared";

/** Standard amortized mortgage: price, down %, annual rate and term → monthly payment and total interest. */
export function MortgageCalculator({ price }: { price: number }) {
  const t = useTranslations("tools.mortgage");
  const m = useMoney();
  const basePrice = price > 0 ? price : 250000;
  const [amount, setAmount] = useState(basePrice);
  const [down, setDown] = useState(30);
  const [rate, setRate] = useState(7.5);
  const [years, setYears] = useState(20);
  useEffect(() => setAmount(basePrice), [basePrice]);

  const loan = amount * (1 - down / 100);
  const n = years * 12;
  const r = rate / 100 / 12;
  const monthly = n > 0 ? (r === 0 ? loan / n : (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)) : 0;
  const totalPaid = monthly * n;
  const totalInterest = Math.max(0, totalPaid - loan);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10">
      <div className="min-w-0 space-y-6">
        <SliderField
          label={t("price")}
          value={Math.round(m.toLocal(amount))}
          onChange={(v) => setAmount(m.fromLocal(v))}
          min={Math.round(m.toLocal(Math.max(25000, basePrice * 0.4)))}
          max={Math.round(m.toLocal(Math.max(basePrice * 2.5, 500000)))}
          step={moneyStep(m.rate)}
          suffix={m.currency}
        />
        <SliderField label={t("down")} value={down} onChange={setDown} min={5} max={90} suffix="%" hint={m.fmt((amount * down) / 100)} />
        <SliderField label={t("rate")} value={rate} onChange={setRate} min={1} max={18} step={0.1} decimals={1} suffix="%" />
        <SliderField label={t("years")} value={years} onChange={(v) => setYears(Math.round(v))} min={5} max={30} hint={t("yearsValue", { count: years })} />
      </div>
      <div className="rounded-3xl border border-line bg-white p-5 sm:p-6">
        <div className="rounded-2xl bg-navy p-5 text-white">
          <p className="text-xs font-bold tracking-[0.18em] text-gold uppercase">{t("monthly")}</p>
          <p className="mt-1 font-display text-5xl tracking-wide tabular-nums">{m.fmt(monthly)}</p>
        </div>
        <dl className="mt-4 divide-y divide-line">
          <ResultRow label={t("loan")} value={m.fmt(loan)} />
          <ResultRow label={t("totalInterest")} value={m.fmt(totalInterest)} />
          <ResultRow label={t("totalPaid")} value={m.fmt(totalPaid)} strong />
        </dl>
        <p className="mt-3 text-[11px] leading-relaxed text-stone">{t("disclaimer")}</p>
      </div>
    </div>
  );
}
