import { useTranslations } from "next-intl";
import { ArrowUpRight, Building, CalendarDays, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { coverOf, MediaImage } from "@/components/ui/Media";
import { PlaceholderBadge } from "@/components/ui/PlaceholderBadge";
import { Price } from "@/components/ui/Price";
import { formatDate } from "@/lib/format";
import type { Locale, Project } from "@/lib/types";
import { slugOf, tr } from "@/lib/utils";

/** Listing card for a project. The flagship links to its dedicated landing. */
export function ProjectCard({ project: p, locale, priority = false }: { project: Project; locale: Locale; priority?: boolean }) {
  const t = useTranslations("project.list");
  const tc = useTranslations("common");
  const href = p.is_flagship ? ({ pathname: "/villas-macao" } as const) : ({ pathname: "/projects/[slug]", params: { slug: slugOf(p, locale) } } as const);
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-line bg-white transition-shadow duration-500 hover:shadow-[0_30px_70px_-35px_rgba(11,31,58,0.45)]">
      <div className="relative overflow-hidden">
        <MediaImage
          media={coverOf(p.media)}
          locale={locale}
          ratio="4/3"
          priority={priority}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          fallbackAlt={p.name}
          imgClassName="transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold tracking-wider text-navy uppercase backdrop-blur">{tc(`status.${p.status}`)}</span>
          {p.is_flagship && <span className="rounded-full bg-gold px-2.5 py-1 text-[10px] font-bold tracking-wider text-navy uppercase">{t("flagship")}</span>}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wide text-stone uppercase">
          <MapPin className="size-3.5 text-gold-dark" aria-hidden />
          {p.zone}
        </p>
        <h2 className="mt-2 text-3xl text-navy">
          <Link href={href} className="after:absolute after:inset-0 after:content-['']">
            {p.name}
          </Link>
        </h2>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone">{tr(p.tagline, locale)}</p>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-navy-soft">
          <span className="inline-flex items-center gap-1.5">
            <Building className="size-3.5 text-gold-dark" aria-hidden />
            {t("units", { count: p.total_units })}
          </span>
          {p.delivery_date && (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-gold-dark" aria-hidden />
              {t("delivery", { date: formatDate(p.delivery_date, locale, { month: "short", year: "numeric", timeZone: "UTC" }) })}
            </span>
          )}
        </div>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <Price usd={p.price_from} from className="text-xl font-extrabold text-navy" />
          <span className="grid size-10 shrink-0 place-items-center rounded-full border border-line text-navy transition-colors duration-300 group-hover:border-gold group-hover:bg-gold" aria-hidden>
            <ArrowUpRight className="size-4" />
          </span>
        </div>
        <PlaceholderBadge show={p.is_placeholder} className="mt-3 self-start" />
      </div>
    </article>
  );
}
