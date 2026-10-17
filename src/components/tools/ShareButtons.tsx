"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Link2, Share2 } from "lucide-react";
import { WhatsAppIcon } from "@/components/layout/WhatsAppButton";
import { cn } from "@/lib/utils";

/** WhatsApp share, copy link (with "copied" feedback) and the native share sheet when available. */
export function ShareButtons({ title, url, className }: { title: string; url?: string; className?: string }) {
  const t = useTranslations("tools.share");
  const tc = useTranslations("common");
  const [href, setHref] = useState(url ?? "");
  const [canShare, setCanShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setHref(url ?? window.location.href.split("#")[0]);
    setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [url]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(href);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = href;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {}
      ta.remove();
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2200);
  };

  const native = async () => {
    try {
      await navigator.share({ title, url: href });
    } catch {}
  };

  const wa = `https://wa.me/?text=${encodeURIComponent(`${title} ${href}`.trim())}`;
  const btn = "grid size-10 place-items-center rounded-full border border-line bg-white text-navy transition hover:border-gold hover:text-gold-dark";

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="mr-1 text-xs font-bold tracking-[0.18em] text-stone uppercase">{t("label")}</span>
      <a href={wa} target="_blank" rel="noopener noreferrer" aria-label={t("whatsapp")} title={t("whatsapp")} className={btn}>
        <WhatsAppIcon className="size-4" />
      </a>
      <button type="button" onClick={copy} aria-label={tc("copyLink")} title={tc("copyLink")} className={cn(btn, copied && "border-available text-available")}>
        {copied ? <Check className="size-4" aria-hidden /> : <Link2 className="size-4" aria-hidden />}
      </button>
      {canShare && (
        <button type="button" onClick={native} aria-label={t("native")} title={t("native")} className={btn}>
          <Share2 className="size-4" aria-hidden />
        </button>
      )}
      <span role="status" aria-live="polite" className={cn("text-xs font-bold text-available transition-opacity", copied ? "opacity-100" : "opacity-0")}>
        {copied ? tc("copied") : ""}
      </span>
    </div>
  );
}
