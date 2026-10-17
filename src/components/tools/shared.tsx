"use client";
import { useEffect, useId, useState } from "react";
import { useLocale } from "next-intl";
import { useSite } from "@/components/providers/SiteProvider";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Money helpers bound to the visitor's selected currency. All stored values are USD. */
export function useMoney() {
  const { currency, rates } = useSite();
  const locale = useLocale();
  const rate = currency === "DOP" ? rates.DOP : currency === "EUR" ? rates.EUR : 1;
  return {
    currency,
    locale,
    rate,
    fmt: (usd: number, compact = false) => formatPrice(Number.isFinite(usd) ? usd : 0, currency, rates, locale, compact) ?? "",
    toLocal: (usd: number) => usd * rate,
    fromLocal: (v: number) => v / rate,
  };
}

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Numeric input that tolerates partial typing (empty, trailing dot) and commits on valid values. */
export function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  decimals = 0,
  suffix,
  id,
  ariaLabel,
  className,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  decimals?: number;
  suffix?: string;
  id?: string;
  ariaLabel?: string;
  className?: string;
}) {
  const show = (v: number) => (Number.isFinite(v) ? String(Number(v.toFixed(decimals))) : "");
  const [text, setText] = useState(show(value));
  useEffect(() => {
    if (Number(text) !== Number(value.toFixed(decimals))) setText(show(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <div className={cn("relative", className)}>
      <input
        id={id}
        aria-label={ariaLabel}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          const n = Number(e.target.value);
          if (e.target.value !== "" && Number.isFinite(n)) onChange(clamp(n, min, max));
        }}
        onBlur={() => setText(show(value))}
        className={cn("field py-2 text-right tabular-nums", suffix ? "pr-12" : "pr-3")}
      />
      {suffix && <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs font-bold text-stone">{suffix}</span>}
    </div>
  );
}

/** Label + range slider + numeric input, kept in sync. */
export function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  decimals = 0,
  suffix,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  decimals?: number;
  suffix?: string;
  hint?: string;
}) {
  const id = useId();
  return (
    <div>
      <div className="mb-2 flex items-end justify-between gap-3">
        <label htmlFor={id} className="label mb-0">
          {label}
          {hint && <span className="mt-0.5 block text-[11px] font-semibold text-stone">{hint}</span>}
        </label>
        <NumberInput id={id} value={value} onChange={onChange} min={min} max={max} step={step} decimals={decimals} suffix={suffix} className="w-36 shrink-0" />
      </div>
      <input
        type="range"
        className="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={clamp(value, min, max)}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

/** Label/value row for results. */
export function ResultRow({ label, value, strong = false, dot }: { label: string; value: string; strong?: boolean; dot?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="inline-flex min-w-0 items-center gap-2 text-sm text-stone">
        {dot && <span className="size-2.5 shrink-0 rounded-full" style={{ background: dot }} aria-hidden />}
        <span className="truncate">{label}</span>
      </dt>
      <dd className={cn("shrink-0 text-right tabular-nums", strong ? "text-lg font-extrabold text-navy" : "font-bold text-navy")}>{value}</dd>
    </div>
  );
}

/** Nice slider step in local currency (≈ USD 1,000). */
export function moneyStep(rate: number) {
  const raw = 1000 * rate;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  return Math.max(1, Math.round(raw / mag) * mag);
}
