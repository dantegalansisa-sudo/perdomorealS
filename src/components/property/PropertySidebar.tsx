"use client";

import { useTranslations } from "next-intl";
import { CalendarDays } from "lucide-react";
import { useWhatsApp, WhatsAppIcon } from "@/components/layout/WhatsAppButton";
import { Price } from "@/components/ui/Price";
import { CurrencySwitcher } from "@/components/ui/CurrencySwitcher";
import { openLeadModal } from "@/lib/ui-store";
import { track } from "@/lib/analytics";
import { useSite } from "@/components/providers/SiteProvider";

export function PropertySidebar({ price, propertyId, projectId, interest, whatsappMessage }: { price: number | null; propertyId: string; projectId: string | null; interest: string; whatsappMessage: string }) {
  const t = useTranslations("property");
  const tc = useTranslations("common");
  const { phone } = useSite();
  const { href, onClick } = useWhatsApp(projectId, whatsappMessage);
  return (
    <div className="rounded-[1.75rem] border border-line bg-white p-6 shadow-[0_30px_60px_-40px_rgba(11,31,58,0.4)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-bold tracking-wider text-stone uppercase">{tc("specs.price")}</p>
        <CurrencySwitcher />
      </div>
      <Price usd={price} className="font-display mt-2 block text-5xl text-navy" />
      <p className="mt-5 font-bold">{t("interested")}</p>
      <p className="mt-1 text-sm text-stone">{t("interestedText")}</p>
      <div className="mt-5 grid gap-2.5">
        <button type="button" onClick={() => openLeadModal({ type: "price", propertyId, projectId, interest })} className="btn btn-gold w-full uppercase">
          {tc("askPricesLong")}
        </button>
        <button type="button" onClick={() => openLeadModal({ type: "visit", propertyId, projectId, interest })} className="btn btn-navy w-full">
          <CalendarDays className="size-4" aria-hidden />
          {tc("scheduleVisit")}
        </button>
        <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} className="btn w-full bg-[#25D366] text-white hover:brightness-95">
          <WhatsAppIcon className="size-5" />
          WhatsApp
        </a>
        {phone && (
          <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} onClick={() => track("phone_click", { location: "property_sidebar" })} className="text-center text-sm font-semibold text-navy-soft underline-offset-4 hover:underline">
            {phone}
          </a>
        )}
      </div>
    </div>
  );
}
