"use client";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useStore } from "@/lib/stores";
import { pageContext } from "@/lib/ui-store";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const t = useTranslations("common");
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const { alternates } = useStore(pageContext);
  const [pending, start] = useTransition();

  const go = (next: "es" | "en") => {
    if (next === locale) return;
    if (alternates?.[next]) {
      window.location.assign(alternates[next]);
      return;
    }
    start(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.replace({ pathname, params } as any, { locale: next });
    });
  };

  return (
    <div role="group" aria-label={t("language")} className={cn("inline-flex rounded-full border border-line bg-white/70 p-0.5 text-xs font-bold", pending && "opacity-60", className)}>
      {(["es", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          onClick={() => go(l)}
          aria-pressed={locale === l}
          className={cn("rounded-full px-2.5 py-1 uppercase transition-colors", locale === l ? "bg-navy text-white" : "text-navy-soft hover:text-navy")}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
