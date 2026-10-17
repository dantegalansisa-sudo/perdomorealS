"use client";
import { track } from "@/lib/analytics";

export function FooterContactLinks({ phone, email, phoneIcon, mailIcon }: { phone: string; email: string; phoneIcon: React.ReactNode; mailIcon: React.ReactNode }) {
  return (
    <>
      {phone && (
        <li>
          <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} onClick={() => track("phone_click", { location: "footer" })} className="flex items-center gap-3 hover:text-gold">
            {phoneIcon}
            {phone}
          </a>
        </li>
      )}
      {email && (
        <li>
          <a href={`mailto:${email}`} onClick={() => track("email_click", { location: "footer" })} className="flex items-center gap-3 hover:text-gold">
            {mailIcon}
            {email}
          </a>
        </li>
      )}
    </>
  );
}

export function CookieSettingsButton({ label }: { label: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event("pre:open-consent"))} className="hover:text-gold">
      {label}
    </button>
  );
}
