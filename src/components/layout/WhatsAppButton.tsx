"use client";
import { useLocale, useTranslations } from "next-intl";
import { logWhatsAppClick } from "@/app/actions/leads";
import { useSite } from "@/components/providers/SiteProvider";
import { track } from "@/lib/analytics";
import { useStore } from "@/lib/stores";
import { pageContext } from "@/lib/ui-store";
import { cn, tr, waLink } from "@/lib/utils";

export function useWhatsApp(projectIdOverride?: string | null, customMessage?: string) {
  const site = useSite();
  const ctx = useStore(pageContext);
  const locale = useLocale();
  const projectId = projectIdOverride ?? ctx.projectId ?? null;
  const message =
    customMessage ??
    ctx.whatsappMessage ??
    (projectId && site.whatsappProjects[projectId] ? tr(site.whatsappProjects[projectId], locale) : tr(site.whatsappDefault, locale));
  const href = waLink(site.whatsappNumber, message);
  const onClick = () => {
    track("whatsapp_click", { project_id: projectId ?? undefined, page: window.location.pathname });
    void logWhatsAppClick({ projectId, propertyId: ctx.propertyId, locale, sourceUrl: window.location.href });
  };
  return { href, onClick };
}

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.27.49 1.7.63.71.22 1.36.19 1.88.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.56.93.95-3.47-.23-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.44-9.43a9.4 9.4 0 0 1 9.43 9.44c0 5.2-4.24 9.43-9.44 9.43m8.03-17.46A11.3 11.3 0 0 0 12.05.7C5.79.7.7 5.79.7 12.04c0 2 .52 3.95 1.52 5.67L.6 23.6l6.02-1.58a11.3 11.3 0 0 0 5.42 1.38h.01c6.25 0 11.34-5.09 11.35-11.34 0-3.03-1.18-5.88-3.32-8.02" />
    </svg>
  );
}

/** Floating WhatsApp bubble (desktop) — mobile uses the bottom bar instead. */
export function WhatsAppFloat() {
  const { href, onClick } = useWhatsApp();
  const t = useTranslations("common");
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      aria-label={t("whatsappAria")}
      className={cn(
        "group fixed right-6 bottom-6 z-50 hidden items-center gap-2 rounded-full bg-whatsapp p-4 text-white shadow-[0_18px_40px_-14px_rgba(10,125,90,0.7)] transition-transform hover:scale-105 md:flex"
      )}
    >
      <WhatsAppIcon className="size-6" />
      <span className="max-w-0 overflow-hidden text-sm font-bold whitespace-nowrap transition-all duration-500 group-hover:max-w-40">{t("whatsappCta")}</span>
    </a>
  );
}
