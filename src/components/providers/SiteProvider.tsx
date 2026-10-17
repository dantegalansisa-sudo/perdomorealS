"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Currency, Rates } from "@/lib/format";
import type { I18nText } from "@/lib/types";

export type PublicSettings = {
  whatsappNumber: string;
  whatsappDefault: I18nText;
  whatsappProjects: Record<string, I18nText>;
  email: string;
  phone: string;
  rates: Rates;
  showPlaceholders: boolean;
  gtmId: string | null;
  ga4Id: string | null;
  projects: { id: string; name: string }[];
};

type Ctx = PublicSettings & { currency: Currency; setCurrency: (c: Currency) => void };
const SiteContext = createContext<Ctx | null>(null);
const CURRENCY_KEY = "pre:currency";

export function SiteProvider({ settings, children }: { settings: PublicSettings; children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("USD");
  useEffect(() => {
    try {
      const c = localStorage.getItem(CURRENCY_KEY) as Currency | null;
      if (c === "USD" || c === "DOP" || c === "EUR") setCurrencyState(c);
    } catch {}
  }, []);
  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(CURRENCY_KEY, c);
    } catch {}
  }, []);
  const value = useMemo(() => ({ ...settings, currency, setCurrency }), [settings, currency, setCurrency]);
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used inside SiteProvider");
  return ctx;
}
