"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLocale } from "next-intl";
import { Plus } from "lucide-react";
import { PlaceholderBadge } from "@/components/ui/PlaceholderBadge";
import type { Faq } from "@/lib/types";
import { cn, tr } from "@/lib/utils";

export function FaqAccordion({ faqs, className }: { faqs: Faq[]; className?: string }) {
  const locale = useLocale();
  const [open, setOpen] = useState<string | null>(faqs[0]?.id ?? null);
  return (
    <div className={cn("divide-y divide-line border-y border-line", className)}>
      {faqs.map((f) => {
        const isOpen = open === f.id;
        return (
          <div key={f.id}>
            <h3 className="font-sans text-base font-bold tracking-normal normal-case sm:text-lg">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`faq-${f.id}`}
                onClick={() => setOpen(isOpen ? null : f.id)}
                className="flex w-full items-center justify-between gap-6 py-6 text-left leading-snug"
              >
                <span>{tr(f.question, locale)}</span>
                <span className={cn("grid size-9 shrink-0 place-items-center rounded-full border border-line transition-all duration-500", isOpen && "rotate-45 border-gold bg-gold text-navy")}>
                  <Plus className="size-4" aria-hidden />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`faq-${f.id}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.25, 0.8, 0.25, 1] }}
                  className="overflow-hidden"
                >
                  <div className="max-w-3xl pb-6 text-stone">
                    <p className="leading-relaxed">{tr(f.answer, locale)}</p>
                    <PlaceholderBadge show={f.is_placeholder} className="mt-3" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
