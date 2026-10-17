"use client";
import { useTranslations } from "next-intl";
import { openLeadModal } from "@/lib/ui-store";
import { useWhatsApp, WhatsAppIcon } from "./WhatsAppButton";

/** Fixed bottom bar on mobile: WhatsApp + price request. */
export function MobileBar() {
  const t = useTranslations("common");
  const { href, onClick } = useWhatsApp();
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-sand/95 px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] backdrop-blur-md md:hidden">
      <div className="grid grid-cols-2 gap-2">
        <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} className="btn bg-[#25D366] px-3 py-3 text-white">
          <WhatsAppIcon className="size-5" />
          WhatsApp
        </a>
        <button type="button" onClick={() => openLeadModal({ type: "price" })} className="btn btn-navy px-3 py-3">
          {t("askPrices")}
        </button>
      </div>
    </div>
  );
}
