"use client";

import { useTranslations } from "next-intl";
import { Mail, Phone } from "lucide-react";
import { useWhatsApp, WhatsAppIcon } from "@/components/layout/WhatsAppButton";
import { track } from "@/lib/analytics";

export function ContactChannels({ phone, email }: { phone: string; email: string }) {
  const t = useTranslations("pages.contact");
  const { href, onClick } = useWhatsApp();
  const items = [
    { label: t("whatsapp"), value: phone, href, icon: <WhatsAppIcon className="size-5" />, onClick, external: true, tone: "bg-[#25D366] text-white" },
    { label: t("phone"), value: phone, href: `tel:${phone.replace(/[^\d+]/g, "")}`, icon: <Phone className="size-5" />, onClick: () => track("phone_click", { location: "contact" }), tone: "bg-navy text-white" },
    { label: t("email"), value: email, href: `mailto:${email}`, icon: <Mail className="size-5" />, onClick: () => track("email_click", { location: "contact" }), tone: "bg-gold text-navy" },
  ];
  return (
    <ul className="mt-10 grid gap-3">
      {items.map((it) => (
        <li key={it.label}>
          <a
            href={it.href}
            onClick={it.onClick}
            target={it.external ? "_blank" : undefined}
            rel={it.external ? "noopener noreferrer" : undefined}
            className="group flex items-center gap-4 rounded-2xl border border-line bg-white p-4 transition-colors hover:border-gold"
          >
            <span className={`grid size-12 shrink-0 place-items-center rounded-full ${it.tone}`}>{it.icon}</span>
            <span className="min-w-0">
              <span className="block text-xs font-bold tracking-wider text-stone uppercase">{it.label}</span>
              <span className="block truncate font-semibold group-hover:text-gold-dark">{it.value}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
