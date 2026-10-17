"use client";

import { useTranslations } from "next-intl";
import { LazyMap, type MapMarker } from "@/components/map/LazyMap";
import { Counter } from "@/components/motion/Counter";
import { useWhatsApp, WhatsAppIcon } from "@/components/layout/WhatsAppButton";

export function StatsBar({ stats, locale }: { stats: { value: number; suffix?: string; label: string; plain?: boolean }[]; locale: string }) {
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[2rem] border border-line bg-line sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((s, i) => (
        <div key={i} className="flex flex-col gap-1 bg-white p-6 last:col-span-2 sm:last:col-span-1 lg:p-8">
          <dt className="order-2 text-xs font-semibold tracking-wide text-stone uppercase">{s.label}</dt>
          <dd className="font-display order-1 text-5xl text-navy lg:text-6xl">{s.plain ? s.value : <Counter to={s.value} suffix={s.suffix} locale={locale} />}</dd>
        </div>
      ))}
    </dl>
  );
}

export function HomeMap({ markers }: { markers: MapMarker[] }) {
  return <LazyMap markers={markers} className="h-full w-full" />;
}

export function ContactWhatsApp() {
  const t = useTranslations("home.contact");
  const { href, onClick } = useWhatsApp();
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} className="btn bg-[#25D366] text-white hover:brightness-95">
      <WhatsAppIcon className="size-5" />
      {t("whatsapp")}
    </a>
  );
}
