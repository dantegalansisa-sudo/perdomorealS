import { getTranslations } from "next-intl/server";
import { Clock, ExternalLink, MapPin } from "lucide-react";
import { LazyMap, type MapMarker } from "@/components/map/LazyMap";
import { Reveal } from "@/components/motion/Reveal";
import type { Locale, Project } from "@/lib/types";
import { tr } from "@/lib/utils";

/** Reference points around Punta Cana (approximate). Shown when within range of the project. */
const POIS = [
  { key: "macaoBeach", lat: 18.7741, lng: -68.5398 },
  { key: "airport", lat: 18.5674, lng: -68.3634 },
  { key: "bavaro", lat: 18.6905, lng: -68.4412 },
  { key: "capCana", lat: 18.4523, lng: -68.4069 },
  { key: "uveroAlto", lat: 18.8063, lng: -68.5972 },
] as const;

function km(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

export async function LocationSection({ project, locale }: { project: Project; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "project.location" });
  const markers: MapMarker[] = [
    { id: project.id, lat: project.lat, lng: project.lng, label: project.name, popup: project.location_name },
    ...POIS.filter((p) => {
      const d = km(project, p);
      return d > 1.5 && d < 45;
    }).map((p) => ({ id: p.key, lat: p.lat, lng: p.lng, label: t(`pois.${p.key}`) })),
  ];
  const maps = `https://www.google.com/maps/search/?api=1&query=${project.lat},${project.lng}`;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-10">
      <Reveal className="relative isolate h-[340px] overflow-hidden rounded-3xl border border-line sm:h-[420px] lg:h-[520px]">
        <LazyMap markers={markers} activeId={project.id} className="h-full w-full" />
      </Reveal>
      <div>
        <p className="inline-flex items-center gap-2 text-sm font-bold text-navy">
          <MapPin className="size-4 text-gold-dark" aria-hidden />
          {project.location_name}
        </p>
        <h3 className="mt-6 font-sans text-xs font-bold tracking-[0.18em] text-stone uppercase">{t("distances")}</h3>
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {project.distances.map((d, i) => (
            <li key={i} className="flex items-center justify-between gap-4 py-3.5">
              <span className="text-sm font-semibold text-navy">{tr(d.label, locale)}</span>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-sand-2 px-3 py-1 text-xs font-bold text-navy-soft tabular-nums">
                <Clock className="size-3 text-gold-dark" aria-hidden />
                {d.minutes != null ? t("minutes", { count: d.minutes }) : d.value}
              </span>
            </li>
          ))}
        </ul>
        <a href={maps} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm mt-6">
          <ExternalLink className="size-4" aria-hidden />
          {t("openMaps")}
        </a>
      </div>
    </div>
  );
}
