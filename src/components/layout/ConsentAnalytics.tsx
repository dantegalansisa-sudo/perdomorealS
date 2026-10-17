"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useSite } from "@/components/providers/SiteProvider";

const KEY = "pre:consent";
type Consent = "granted" | "denied" | null;

function readConsent(): Consent {
  try {
    const v = localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

function loadScript(src: string) {
  if (document.querySelector(`script[src="${src}"]`)) return;
  const s = document.createElement("script");
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

/** GTM / GA4 only load after explicit consent. Events pushed earlier stay queued in dataLayer. */
function loadAnalytics(gtmId: string | null, ga4Id: string | null) {
  window.dataLayer = window.dataLayer || [];
  const gtag = (...args: unknown[]) => window.dataLayer!.push(args as unknown as Record<string, unknown>);
  gtag("consent", "update", { ad_storage: "granted", analytics_storage: "granted", ad_user_data: "granted", ad_personalization: "granted" });
  if (gtmId) {
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    loadScript(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`);
  } else if (ga4Id) {
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4Id)}`);
    gtag("js", new Date());
    gtag("config", ga4Id, { anonymize_ip: true });
  }
}

export function ConsentAnalytics() {
  const { gtmId, ga4Id } = useSite();
  const t = useTranslations("common");
  const [consent, setConsent] = useState<Consent>("denied");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const c = readConsent();
    setConsent(c);
    setReady(true);
    if (c === "granted") loadAnalytics(gtmId, ga4Id);
    const reopen = () => setConsent(null);
    window.addEventListener("pre:open-consent", reopen);
    return () => window.removeEventListener("pre:open-consent", reopen);
  }, [gtmId, ga4Id]);

  const decide = (c: "granted" | "denied") => {
    try {
      localStorage.setItem(KEY, c);
    } catch {}
    setConsent(c);
    if (c === "granted") loadAnalytics(gtmId, ga4Id);
  };

  return (
    <AnimatePresence>
      {ready && consent === null && (
        <motion.div
          role="dialog"
          aria-live="polite"
          aria-label={t("cookies.title")}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          className="fixed inset-x-3 bottom-[5.25rem] z-[70] mx-auto max-w-lg rounded-3xl border border-line bg-white/95 p-5 shadow-2xl backdrop-blur md:bottom-6 md:left-6 md:right-auto md:mx-0"
        >
          <p className="mb-1 text-sm font-bold">{t("cookies.title")}</p>
          <p className="mb-4 text-xs leading-relaxed text-stone">
            {t("cookies.text")}{" "}
            <Link href="/legal/cookies" className="underline underline-offset-2">
              {t("cookies.more")}
            </Link>
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={() => decide("denied")} className="btn btn-ghost btn-sm flex-1">
              {t("cookies.reject")}
            </button>
            <button type="button" onClick={() => decide("granted")} className="btn btn-navy btn-sm flex-1">
              {t("cookies.accept")}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
