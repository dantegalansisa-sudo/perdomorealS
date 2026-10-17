"use client";
import { useTranslations } from "next-intl";
import { CalendarDays } from "lucide-react";
import { Magnetic } from "@/components/motion/Magnetic";
import { useWhatsApp, WhatsAppIcon } from "@/components/layout/WhatsAppButton";
import { openLeadModal } from "@/lib/ui-store";
import { cn } from "@/lib/utils";

/** Hero CTAs: price & availability (primary), visit, and WhatsApp with the project's prefilled message. */
export function ProjectCtas({ projectId, interest, className }: { projectId: string; interest: string; className?: string }) {
  const tc = useTranslations("common");
  const t = useTranslations("project.hero");
  const wa = useWhatsApp(projectId);
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:flex-wrap", className)}>
      <Magnetic strength={0.15} className="block sm:inline-block">
        <button
          type="button"
          onClick={() => openLeadModal({ type: "price", projectId, interest })}
          className="btn btn-gold w-full px-6 text-center tracking-[0.06em] whitespace-normal uppercase sm:w-auto"
        >
          {tc("askPricesLong")}
        </button>
      </Magnetic>
      <button
        type="button"
        onClick={() => openLeadModal({ type: "visit", projectId, interest })}
        className="btn btn-ghost w-full whitespace-normal sm:w-auto"
      >
        <CalendarDays className="size-4 shrink-0" aria-hidden />
        {tc("scheduleVisit")}
      </button>
      <a href={wa.href} onClick={wa.onClick} target="_blank" rel="noopener noreferrer" className="btn w-full bg-whatsapp text-white hover:brightness-95 sm:w-auto">
        <WhatsAppIcon className="size-5" />
        {t("whatsapp")}
      </a>
    </div>
  );
}

/** Inline WhatsApp link with the project's prefilled message (tracked). */
export function ProjectWhatsAppLink({ projectId, label, className }: { projectId: string; label: string; className?: string }) {
  const wa = useWhatsApp(projectId);
  return (
    <a href={wa.href} onClick={wa.onClick} target="_blank" rel="noopener noreferrer" className={cn("inline-flex items-center gap-2 font-bold text-navy underline-offset-4 hover:underline", className)}>
      <span className="grid size-9 place-items-center rounded-full bg-whatsapp text-white">
        <WhatsAppIcon className="size-4" />
      </span>
      {label}
    </a>
  );
}
