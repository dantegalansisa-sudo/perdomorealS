"use client";
import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { leadModal, pageContext } from "@/lib/ui-store";
import { useStore } from "@/lib/stores";
import { LeadForm } from "./LeadForm";

/** Global lead modal, opened from any "Consultar precios" / "Agendar visita" button via openLeadModal(). */
export function LeadModal() {
  const state = useStore(leadModal);
  const ctx = useStore(pageContext);
  const t = useTranslations("forms");
  const close = () => leadModal.set({ open: false });

  useEffect(() => {
    if (!state.open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [state.open]);

  const title = state.type === "price" ? t("modalPriceTitle") : state.type === "visit" ? t("modalVisitTitle") : t("modalInfoTitle");

  return (
    <AnimatePresence>
      {state.open && (
        <motion.div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button type="button" aria-label={t("close")} className="absolute inset-0 bg-navy/50 backdrop-blur-sm" onClick={close} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="lead-modal-title"
            data-lenis-prevent
            className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-[2rem] bg-sand p-6 shadow-2xl sm:max-w-xl sm:rounded-[2rem] sm:p-8"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
          >
            <button type="button" onClick={close} aria-label={t("close")} className="absolute top-4 right-4 grid size-10 place-items-center rounded-full bg-white text-navy hover:bg-gold-soft">
              <X className="size-4" />
            </button>
            <p className="eyebrow mb-2">Perdomo Real Estate</p>
            <h2 id="lead-modal-title" className="mb-1 pr-10 text-4xl">
              {title}
            </h2>
            <p className="mb-6 text-sm text-stone">{t("modalSubtitle")}</p>
            <LeadForm
              type={state.type}
              projectId={state.projectId ?? ctx.projectId}
              propertyId={state.propertyId ?? ctx.propertyId}
              interest={state.interest ?? ctx.interest}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
