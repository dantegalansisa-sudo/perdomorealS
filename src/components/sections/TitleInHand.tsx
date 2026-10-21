import { useTranslations } from "next-intl";
import { BadgeCheck, FileCheck2, KeyRound, ScrollText } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

/**
 * "Título en mano" — the client's key trust message: every property is titled and the
 * title is handed to the buyer at closing.
 */
export function TitleInHandBand({ className }: { className?: string }) {
  const t = useTranslations("common.titleInHand");
  const points = [
    { icon: ScrollText, k: "issued" },
    { icon: KeyRound, k: "delivered" },
    { icon: FileCheck2, k: "reviewed" },
  ] as const;
  return (
    <Reveal className={cn("relative overflow-hidden rounded-[2rem] border border-gold/40 bg-white p-6 shadow-[0_30px_70px_-45px_rgba(11,31,58,0.45)] sm:p-9 lg:p-10", className)}>
      <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-gold/10 blur-3xl" />
      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)] lg:items-center lg:gap-12">
        <div className="flex items-start gap-5">
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-navy text-gold shadow-lg sm:size-20">
            <BadgeCheck className="size-8 sm:size-10" aria-hidden />
          </span>
          <div>
            <p className="eyebrow mb-2">{t("badge")}</p>
            <h2 className="text-3xl text-navy sm:text-4xl lg:text-5xl">{t("title")}</h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-stone sm:text-base">{t("text")}</p>
          </div>
        </div>
        <ul className="grid gap-3 sm:grid-cols-3">
          {points.map(({ icon: Icon, k }) => (
            <li key={k} className="rounded-2xl border border-line bg-sand p-4 sm:p-5">
              <Icon className="size-5 text-gold-dark" aria-hidden />
              <p className="mt-3 text-sm font-bold text-navy">{t(`points.${k}.title`)}</p>
              <p className="mt-1 text-xs leading-relaxed text-stone">{t(`points.${k}.text`)}</p>
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}

/** Compact one-line version for sidebars and cards. */
export function TitleInHandInline({ className, dark = false }: { className?: string; dark?: boolean }) {
  const t = useTranslations("common.titleInHand");
  return (
    <p className={cn("inline-flex items-center gap-1.5 text-xs font-bold", dark ? "text-gold" : "text-available-ink", className)}>
      <BadgeCheck className="size-4 shrink-0" aria-hidden />
      {t("badge")}
    </p>
  );
}
