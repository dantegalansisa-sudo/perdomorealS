export type Currency = "USD" | "DOP" | "EUR";
export type Rates = { DOP: number; EUR: number };

export function convert(usd: number, currency: Currency, rates: Rates) {
  if (currency === "DOP") return usd * rates.DOP;
  if (currency === "EUR") return usd * rates.EUR;
  return usd;
}

export function formatMoney(amount: number, currency: Currency, locale: string, compact = false) {
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "es-DO", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
    notation: compact ? "compact" : "standard",
  }).format(amount);
}

export function formatPrice(usd: number | null | undefined, currency: Currency, rates: Rates, locale: string, compact = false) {
  if (usd == null) return null;
  return formatMoney(convert(usd, currency, rates), currency, locale, compact);
}

export function formatNumber(n: number, locale: string) {
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "es-DO", { maximumFractionDigits: 1 }).format(n);
}

export function formatDate(iso: string, locale: string, opts: Intl.DateTimeFormatOptions = { dateStyle: "long" }) {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-DO", opts).format(new Date(iso));
}
