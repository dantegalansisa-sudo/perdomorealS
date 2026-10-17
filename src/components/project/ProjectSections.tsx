import { useTranslations } from "next-intl";
import { Download, ExternalLink, FileText, Hourglass } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Price } from "@/components/ui/Price";
import { formatDate } from "@/lib/format";
import type { Locale, PaymentPlan, Project } from "@/lib/types";
import { cn, tr } from "@/lib/utils";

/** Section shell with consistent rhythm, optional heading and tone. */
export function ProjectSection({
  id,
  eyebrow,
  title,
  lead,
  tone = "sand",
  children,
  className,
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  lead?: string;
  tone?: "sand" | "white" | "sand2";
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-24 py-16 sm:py-24", tone === "white" ? "bg-white" : tone === "sand2" ? "bg-sand-2/60" : "bg-sand", className)}>
      <div className="container-x">
        {title && (
          <div className="mb-10 max-w-3xl sm:mb-14">
            {eyebrow && (
              <Reveal y={12}>
                <p className="eyebrow mb-4 inline-flex items-center gap-3">
                  <span className="h-px w-8 bg-gold" aria-hidden />
                  {eyebrow}
                </p>
              </Reveal>
            )}
            <Reveal>
              <h2 className="text-[2.4rem] text-navy sm:text-6xl">{title}</h2>
            </Reveal>
            {lead && (
              <Reveal delay={0.1}>
                <p className="mt-4 text-base leading-relaxed text-stone sm:text-lg">{lead}</p>
              </Reveal>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

/** Horizontal in-page navigation chips. */
export function SectionNav({ items, label }: { items: { id: string; label: string }[]; label: string }) {
  return (
    <nav aria-label={label} className="border-y border-line bg-white/70 backdrop-blur">
      <div className="container-x">
        <ul className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1 py-3">
          {items.map((it) => (
            <li key={it.id} className="shrink-0">
              <a href={`#${it.id}`} className="inline-block rounded-full px-3.5 py-2 text-xs font-bold tracking-wide text-navy-soft uppercase transition-colors hover:bg-sand-2 hover:text-navy">
                {it.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

/** Hero key facts: from price, units, delivery, status. */
export function KeyFacts({ project, unitsCount, available, unitLabel, locale }: { project: Project; unitsCount: number; available: number | null; unitLabel: string; locale: Locale }) {
  const t = useTranslations("project.hero");
  const tc = useTranslations("common");
  const facts = [
    { label: t("priceFrom"), value: <Price usd={project.price_from} /> },
    { label: unitLabel, value: <span className="tabular-nums">{unitsCount}</span>, sub: available != null ? t("availableCount", { count: available }) : undefined },
    {
      label: t("delivery"),
      value: project.delivery_date ? formatDate(project.delivery_date, locale, { month: "short", year: "numeric", timeZone: "UTC" }) : t("toBeConfirmed"),
    },
    { label: t("status"), value: tc(`status.${project.status}`) },
  ];
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
      {facts.map((f) => (
        <div key={f.label} className="bg-white px-4 py-4">
          <dt className="text-[10px] font-bold tracking-[0.18em] text-stone uppercase">{f.label}</dt>
          <dd className="mt-1 text-lg leading-tight font-extrabold text-navy">{f.value}</dd>
          {f.sub && <dd className="mt-0.5 text-xs font-bold text-available-ink">{f.sub}</dd>}
        </div>
      ))}
    </dl>
  );
}

/** One card per payment plan, amounts computed on the project's starting price. */
export function PaymentPlanCards({ plans, price, locale }: { plans: PaymentPlan[]; price: number | null; locale: Locale }) {
  const t = useTranslations("project.payment");
  if (plans.length === 0) return null;
  return (
    <Stagger className={cn("grid gap-4", plans.length === 1 ? "md:grid-cols-1 md:max-w-xl" : plans.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3")}>
      {plans.map((p, i) => {
        const rows = [
          { label: t("down"), pct: p.down },
          { label: t("during"), pct: p.during },
          { label: t("delivery"), pct: p.delivery },
        ];
        const monthly = price && p.installments > 0 ? (price * p.during) / 100 / p.installments : null;
        return (
          <StaggerItem key={p.id} as="article" className={cn("flex flex-col rounded-3xl border p-6", i === 0 ? "border-navy bg-navy text-white" : "border-line bg-white text-navy")}>
            <h3 className="text-3xl">{tr(p.name, locale)}</h3>
            <p className={cn("mt-1 font-display text-5xl tracking-wide", i === 0 ? "text-gold" : "text-gold-dark")}>
              {p.down}/{p.during}/{p.delivery}
            </p>
            <ul className={cn("mt-5 divide-y text-sm", i === 0 ? "divide-white/15" : "divide-line")}>
              {rows.map((r) => (
                <li key={r.label} className="flex items-baseline justify-between gap-3 py-2.5">
                  <span className={i === 0 ? "text-white/75" : "text-stone"}>
                    {r.label} · <b className={i === 0 ? "text-white" : "text-navy"}>{r.pct}%</b>
                  </span>
                  {price ? <Price usd={(price * r.pct) / 100} className="font-bold tabular-nums" /> : null}
                </li>
              ))}
            </ul>
            <div className={cn("mt-auto pt-5 text-sm", i === 0 ? "text-white/75" : "text-stone")}>
              <p>{t("installments", { count: p.installments })}</p>
              {monthly && (
                <p className="mt-1">
                  {t("monthly")}: <Price usd={monthly} className={cn("font-extrabold", i === 0 ? "text-white" : "text-navy")} />
                </p>
              )}
            </div>
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}

export function DeveloperBlock({ project, locale }: { project: Project; locale: Locale }) {
  const t = useTranslations("project.developer");
  const d = project.developer;
  if (!d?.name) return null;
  return (
    <div className="grid gap-6 rounded-[2rem] border border-line bg-white p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-12">
      <div>
        <p className="eyebrow">{t("eyebrow")}</p>
        <p className="mt-3 font-display text-4xl text-navy sm:text-5xl">{d.name}</p>
      </div>
      <div>
        <p className="leading-relaxed text-stone sm:text-lg">{tr(d.description, locale)}</p>
        {d.website && /^https?:\/\//.test(d.website) && (
          <a href={d.website} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm mt-6">
            <ExternalLink className="size-4" aria-hidden />
            {t("website")}
          </a>
        )}
      </div>
    </div>
  );
}

export function DocumentsList({ project, locale, brochureHref }: { project: Project; locale: Locale; brochureHref: string }) {
  const t = useTranslations("project.documents");
  // The generated brochure replaces an empty "brochure" entry.
  const docs = project.documents.filter((d) => d.url || !/brochure/i.test(`${d.name.es} ${d.name.en}`));
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      <li>
        <a
          href={brochureHref}
          className="group flex items-center gap-4 rounded-3xl border border-gold/50 bg-gold-soft/30 p-5 transition-colors hover:border-gold hover:bg-gold-soft/60"
          rel="nofollow"
        >
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gold text-navy">
            <FileText className="size-5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-bold text-navy">{t("brochure")}</span>
            <span className="block text-xs text-stone">{t("brochureHint")}</span>
          </span>
          <Download className="size-5 shrink-0 text-gold-dark transition-transform group-hover:translate-y-0.5" aria-hidden />
        </a>
      </li>
      {docs.map((d, i) => (
        <li key={i}>
          {d.url ? (
            <a href={d.url} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 rounded-3xl border border-line bg-white p-5 transition-colors hover:border-gold">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-sand-2 text-navy">
                <FileText className="size-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1 font-bold text-navy">{tr(d.name, locale)}</span>
              <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-bold text-gold-dark">
                <Download className="size-4" aria-hidden />
                <span className="hidden sm:inline">{t("download")}</span>
              </span>
            </a>
          ) : (
            <div className="flex items-center gap-4 rounded-3xl border border-dashed border-line bg-white/60 p-5">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-sand-2 text-stone-light">
                <FileText className="size-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-navy-soft">{tr(d.name, locale)}</span>
                <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-sand-2 px-3 py-1 text-[11px] font-bold text-stone">
                  <Hourglass className="size-3" aria-hidden />
                  {t("comingSoon")}
                </span>
              </span>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
