"use client";
import { useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Calculator, House, TrendingUp } from "lucide-react";
import type { PaymentPlan } from "@/lib/types";
import { cn } from "@/lib/utils";
import { MortgageCalculator } from "./MortgageCalculator";
import { PaymentPlanCalculator } from "./PaymentPlanCalculator";
import { RentalRoiCalculator } from "./RentalRoiCalculator";

type Tab = "payment" | "mortgage" | "roi";
const TABS: { key: Tab; icon: typeof Calculator }[] = [
  { key: "payment", icon: Calculator },
  { key: "mortgage", icon: House },
  { key: "roi", icon: TrendingUp },
];

/** Payment plan / mortgage / rental ROI calculators behind accessible tabs. */
export function CalculatorsTabs({ price, plans }: { price: number; plans: PaymentPlan[] }) {
  const t = useTranslations("tools.tabs");
  const [active, setActive] = useState<Tab>("payment");
  const base = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (i + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length;
    setActive(TABS[next].key);
    refs.current[next]?.focus();
  };

  return (
    <div>
      <div role="tablist" aria-label={t("label")} className="no-scrollbar -mx-1 mb-6 flex gap-2 overflow-x-auto px-1 pb-1">
        {TABS.map(({ key, icon: Icon }, i) => (
          <button
            key={key}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${base}-tab-${key}`}
            aria-selected={active === key}
            aria-controls={`${base}-panel-${key}`}
            tabIndex={active === key ? 0 : -1}
            onClick={() => setActive(key)}
            onKeyDown={(e) => onKey(e, i)}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-bold transition-colors",
              active === key ? "border-navy bg-navy text-white" : "border-line bg-white text-navy-soft hover:border-gold"
            )}
          >
            <Icon className="size-4" aria-hidden />
            {t(key)}
          </button>
        ))}
      </div>
      {TABS.map(({ key }) => (
        <div key={key} role="tabpanel" id={`${base}-panel-${key}`} aria-labelledby={`${base}-tab-${key}`} hidden={active !== key}>
          {active === key &&
            (key === "payment" ? (
              <PaymentPlanCalculator price={price} plans={plans} />
            ) : key === "mortgage" ? (
              <MortgageCalculator price={price} />
            ) : (
              <RentalRoiCalculator price={price} />
            ))}
        </div>
      ))}
    </div>
  );
}
