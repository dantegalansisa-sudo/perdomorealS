"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Price } from "@/components/ui/Price";
import { openLeadModal } from "@/lib/ui-store";

/**
 * Sticky "price & availability" CTA. Appears once the hero (#project-hero) leaves the viewport and hides
 * while the lead form (#contacto) is visible. Desktop: slim floating bar clear of the WhatsApp bubble.
 * Mobile: a slim strip stacked directly ABOVE the global fixed bottom bar (~4.5rem).
 */
export function StickyCta({ projectId, interest, name, priceFrom, heroId = "project-hero", formId = "contacto" }: { projectId: string; interest: string; name: string; priceFrom: number | null; heroId?: string; formId?: string }) {
  const tc = useTranslations("common");
  const t = useTranslations("project.sticky");
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hero = document.getElementById(heroId);
    const form = document.getElementById(formId);
    const observers: IntersectionObserver[] = [];
    if (hero) {
      const io = new IntersectionObserver(([e]) => setPastHero(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
      io.observe(hero);
      observers.push(io);
    }
    if (form) {
      const io = new IntersectionObserver(([e]) => setFormVisible(e.isIntersecting), { threshold: 0.15 });
      io.observe(form);
      observers.push(io);
    }
    return () => observers.forEach((o) => o.disconnect());
  }, [heroId, formId]);

  if (!mounted) return null;
  const show = pastHero && !formVisible;
  const open = () => openLeadModal({ type: "price", projectId, interest });

  return createPortal(
    <AnimatePresence>
      {show && (
        <>
          {/* Mobile: above the global bottom bar */}
          <motion.div
            key="m"
            role="region"
            aria-label={t("label")}
            className="fixed inset-x-0 z-[49] px-3 pb-2 md:hidden"
            style={{ bottom: "calc(4.5rem + env(safe-area-inset-bottom))" }}
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.3 }}
          >
            <button type="button" onClick={open} className="btn btn-gold btn-sm w-full py-2.5 text-[0.72rem] tracking-[0.08em] uppercase shadow-lg">
              {tc("askPricesLong")}
            </button>
          </motion.div>
          {/* Desktop: slim floating bar, leaves room for the WhatsApp bubble on the right */}
          <motion.div
            key="d"
            className="pointer-events-none fixed right-28 bottom-6 left-6 z-[49] hidden justify-center md:flex"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              role="region"
              aria-label={t("label")}
              className="pointer-events-auto flex w-full max-w-3xl items-center gap-4 rounded-full border border-line bg-white/90 py-2 pr-2 pl-6 shadow-[0_20px_50px_-20px_rgba(11,31,58,0.45)] backdrop-blur-md"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-lg leading-none tracking-wide text-navy">{name}</p>
                {priceFrom != null && <Price usd={priceFrom} from className="text-sm font-bold text-navy-soft" />}
              </div>
              <button type="button" onClick={open} className="btn btn-navy btn-sm shrink-0 tracking-[0.06em] uppercase">
                {tc("askPricesLong")}
                <ArrowRight className="size-4" aria-hidden />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
