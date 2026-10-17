"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { ChevronDown, MapPin, Search, SlidersHorizontal, Wallet, Home, X } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import type { PropertyType } from "@/lib/types";
import { cn } from "@/lib/utils";

const TYPES: PropertyType[] = ["villa", "apartment", "house", "land"];
const BUDGETS = ["300000", "500000", "1000000", "any"] as const;

type State = { zone: string; type: string; budget: string };

function useSearchNav() {
  const router = useRouter();
  return (s: State) => {
    const query: Record<string, string> = {};
    if (s.zone) query.zone = s.zone;
    if (s.type) query.type = s.type;
    if (s.budget === "any") query.minPrice = "1000000";
    else if (s.budget) query.maxPrice = s.budget;
    router.push({ pathname: "/properties", query });
  };
}

function SelectField({ icon, label, value, onChange, children, id }: { icon: React.ReactNode; label: string; value: string; onChange: (v: string) => void; children: React.ReactNode; id: string }) {
  return (
    <label htmlFor={id} className="group relative flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-full px-4 py-2 transition-colors hover:bg-sand">
      <span className="text-gold-dark">{icon}</span>
      <span className="flex min-w-0 flex-col">
        <span className="text-[10px] font-bold tracking-[0.16em] text-stone uppercase">{label}</span>
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="w-full cursor-pointer appearance-none truncate bg-transparent pr-5 text-sm font-semibold text-navy outline-none">
          {children}
        </select>
      </span>
      <ChevronDown className="pointer-events-none absolute right-3 size-3.5 text-stone" aria-hidden />
    </label>
  );
}

function Fields({ s, set, idPrefix, zones }: { s: State; set: (p: Partial<State>) => void; idPrefix: string; zones: string[] }) {
  const t = useTranslations("home.hero");
  const tc = useTranslations("common");
  return (
    <>
      <SelectField id={`${idPrefix}-zone`} icon={<MapPin className="size-4" />} label={t("location")} value={s.zone} onChange={(zone) => set({ zone })}>
        <option value="">{t("anyLocation")}</option>
        {zones.map((z) => (
          <option key={z} value={z}>
            {z}
          </option>
        ))}
      </SelectField>
      <SelectField id={`${idPrefix}-type`} icon={<Home className="size-4" />} label={t("type")} value={s.type} onChange={(type) => set({ type })}>
        <option value="">{t("anyType")}</option>
        {TYPES.map((ty) => (
          <option key={ty} value={ty}>
            {tc(`types.${ty}`)}
          </option>
        ))}
      </SelectField>
      <SelectField id={`${idPrefix}-budget`} icon={<Wallet className="size-4" />} label={t("budget")} value={s.budget} onChange={(budget) => set({ budget })}>
        <option value="">{t("anyBudget")}</option>
        {BUDGETS.map((b) => (
          <option key={b} value={b}>
            {t(`budgets.${b}`)}
          </option>
        ))}
      </SelectField>
    </>
  );
}

export function QuickChips({ className }: { className?: string }) {
  const t = useTranslations("home.hero");
  const chips = [
    { key: "villasMacao", query: { type: "villa", zone: "Macao" } },
    { key: "apartments", query: { type: "apartment" } },
    { key: "land", query: { type: "land" } },
    { key: "houses", query: { type: "house" } },
  ] as const;
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="text-xs font-semibold text-stone">{t("quick")}</span>
      {chips.map((c) => (
        <Link key={c.key} href={{ pathname: "/properties", query: c.query }} className="chip">
          {t(`chips.${c.key}`)}
        </Link>
      ))}
    </div>
  );
}

/** Desktop: pill with three selects. */
export function HeroSearchDesktop({ zones }: { zones: string[] }) {
  const t = useTranslations("home.hero");
  const [s, setS] = useState<State>({ zone: "", type: "", budget: "" });
  const go = useSearchNav();
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        go(s);
      }}
      className="flex items-center gap-1 rounded-full border border-white bg-white/90 p-1.5 shadow-[0_20px_50px_-24px_rgba(11,31,58,0.45)] backdrop-blur-xl"
    >
      <Fields s={s} set={(p) => setS((x) => ({ ...x, ...p }))} idPrefix="hero-d" zones={zones} />
      <button type="submit" className="btn btn-gold shrink-0 px-5 py-3.5">
        <Search className="size-4" aria-hidden />
        {t("search")}
      </button>
    </form>
  );
}

/** Mobile: a single field that opens a bottom sheet with the filters. */
export function HeroSearchMobile({ zones }: { zones: string[] }) {
  const t = useTranslations("home.hero");
  const tf = useTranslations("forms");
  const [open, setOpen] = useState(false);
  const [s, setS] = useState<State>({ zone: "", type: "", budget: "" });
  const go = useSearchNav();

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="flex w-full items-center gap-3 rounded-full border border-white bg-white/95 p-1.5 pl-5 text-left shadow-[0_16px_40px_-20px_rgba(11,31,58,0.5)]"
      >
        <Search className="size-4 text-gold-dark" aria-hidden />
        <span className="flex-1 text-sm font-semibold text-navy-soft">{t("searchMobile")}</span>
        <span className="grid size-11 place-items-center rounded-full bg-gold text-navy">
          <SlidersHorizontal className="size-4" aria-hidden />
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[80]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button type="button" aria-label={tf("close")} className="absolute inset-0 bg-navy/45 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <motion.form
              role="dialog"
              aria-modal="true"
              aria-label={t("filters")}
              onSubmit={(e) => {
                e.preventDefault();
                go(s);
              }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute inset-x-0 bottom-0 rounded-t-[2rem] bg-sand p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" aria-hidden />
              <div className="mb-4 flex items-center justify-between">
                <p className="font-display text-3xl">{t("filters")}</p>
                <button type="button" onClick={() => setOpen(false)} aria-label={tf("close")} className="grid size-10 place-items-center rounded-full bg-white">
                  <X className="size-4" />
                </button>
              </div>
              <div className="flex flex-col gap-2 rounded-3xl bg-white p-2">
                <Fields s={s} set={(p) => setS((x) => ({ ...x, ...p }))} idPrefix="hero-m" zones={zones} />
              </div>
              <QuickChips className="mt-4" />
              <button type="submit" className="btn btn-gold mt-5 w-full">
                <Search className="size-4" aria-hidden />
                {t("showResults")}
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
