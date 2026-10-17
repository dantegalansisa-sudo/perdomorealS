"use client";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Info } from "lucide-react";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { moneyStep, ResultRow, SliderField, useMoney } from "./shared";

const defaultsFor = (price: number) => ({
  nightly: Math.max(60, Math.round((price * 0.0009) / 5) * 5),
  hoa: Math.max(100, Math.round((price * 0.0011) / 10) * 10),
});

/** Vacation-rental estimate: nightly rate × occupancy, minus management fee and maintenance. Always shows the estimate notice. */
export function RentalRoiCalculator({ price }: { price: number }) {
  const t = useTranslations("tools.roi");
  const tc = useTranslations("common");
  const locale = useLocale();
  const m = useMoney();
  const basePrice = price > 0 ? price : 250000;
  const [amount, setAmount] = useState(basePrice);
  const [nightly, setNightly] = useState(defaultsFor(basePrice).nightly);
  const [occupancy, setOccupancy] = useState(65);
  const [fee, setFee] = useState(20);
  const [hoa, setHoa] = useState(defaultsFor(basePrice).hoa);
  useEffect(() => {
    setAmount(basePrice);
    const d = defaultsFor(basePrice);
    setNightly(d.nightly);
    setHoa(d.hoa);
  }, [basePrice]);

  const nights = Math.round(365 * (occupancy / 100));
  const gross = nightly * nights;
  const management = gross * (fee / 100);
  const hoaAnnual = hoa * 12;
  const net = gross - management - hoaAnnual;
  const roi = amount > 0 ? (net / amount) * 100 : 0;
  const grossYield = amount > 0 ? (gross / amount) * 100 : 0;
  const smallStep = Math.max(1, Math.round(m.toLocal(5)));

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
        <SliderField
          label={t("nightly")}
          value={Math.round(m.toLocal(nightly))}
          onChange={(v) => setNightly(m.fromLocal(v))}
          min={Math.round(m.toLocal(40))}
          max={Math.round(m.toLocal(2000))}
          step={smallStep}
          suffix={m.currency}
        />
        <SliderField label={t("occupancy")} value={occupancy} onChange={setOccupancy} min={10} max={95} suffix="%" hint={t("nights", { count: nights })} />
        <SliderField label={t("management")} value={fee} onChange={setFee} min={0} max={45} suffix="%" />
        <SliderField
          label={t("hoa")}
          value={Math.round(m.toLocal(hoa))}
          onChange={(v) => setHoa(m.fromLocal(v))}
          min={0}
          max={Math.round(m.toLocal(3000))}
          step={smallStep}
          suffix={m.currency}
        />
      </div>
      <div className="rounded-3xl border border-line bg-white p-5 sm:p-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-navy p-4 text-white sm:p-5">
            <p className="text-[11px] font-bold tracking-[0.18em] text-gold uppercase">{t("roi")}</p>
            <p className={cn("mt-1 font-display text-4xl tracking-wide tabular-nums sm:text-5xl", roi < 0 && "text-[#f0a49d]")}>{formatNumber(roi, locale)}%</p>
          </div>
          <div className="rounded-2xl bg-sand-2 p-4 sm:p-5">
            <p className="text-[11px] font-bold tracking-[0.18em] text-stone uppercase">{t("grossYield")}</p>
            <p className="mt-1 font-display text-4xl tracking-wide text-navy tabular-nums sm:text-5xl">{formatNumber(grossYield, locale)}%</p>
          </div>
        </div>
        <dl className="mt-4 divide-y divide-line">
          <ResultRow label={t("gross")} value={m.fmt(gross)} />
          <ResultRow label={`− ${t("managementCost")} (${fee}%)`} value={m.fmt(management)} />
          <ResultRow label={`− ${t("hoaAnnual")}`} value={m.fmt(hoaAnnual)} />
          <ResultRow label={t("net")} value={m.fmt(net)} strong />
        </dl>
        <p className="mt-4 flex gap-2 rounded-2xl bg-gold-soft/40 p-3 text-[11px] leading-relaxed text-navy-soft">
          <Info className="mt-0.5 size-3.5 shrink-0 text-gold-dark" aria-hidden />
          {tc("estimateNotice")}
        </p>
      </div>
    </div>
  );
}
