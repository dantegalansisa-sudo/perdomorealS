import { getTranslations } from "next-intl/server";
import { CheckCircle2 } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { RevealText } from "@/components/motion/RevealText";
import { LeadForm } from "@/components/forms/LeadForm";
import { PropertyCard } from "@/components/property/PropertyCard";
import { FaqAccordion } from "@/components/sections/FaqAccordion";
import { CalculatorsTabs } from "@/components/tools/CalculatorsTabs";
import { Gallery } from "@/components/tools/Gallery";
import { ShareButtons } from "@/components/tools/ShareButtons";
import { VideoEmbed } from "@/components/tools/VideoEmbed";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/ui/JsonLd";
import { PlaceholderBadge } from "@/components/ui/PlaceholderBadge";
import { faqSchema } from "@/lib/schema";
import type { Faq, Locale, Project, Property, Unit, VillaModel } from "@/lib/types";
import { slugOf, tr } from "@/lib/utils";
import { AmenitiesGrid } from "./AmenitiesGrid";
import { AvailabilityTable } from "./AvailabilityTable";
import { ConstructionTimeline } from "./ConstructionTimeline";
import { LocationSection } from "./LocationSection";
import { Masterplan } from "./Masterplan";
import { ModelsTabs } from "./ModelsTabs";
import { ProjectCtas, ProjectWhatsAppLink } from "./ProjectCtas";
import { DeveloperBlock, DocumentsList, KeyFacts, PaymentPlanCards, ProjectSection, SectionNav } from "./ProjectSections";
import { StickyCta } from "./StickyCta";

export type ProjectViewProps = {
  project: Project;
  models: VillaModel[];
  units: Unit[];
  faqs: Faq[];
  properties?: Property[];
  locale: Locale;
  h1: string;
  eyebrow: string;
  breadcrumbs: { name: string; url: string }[];
  pageUrl: string;
  /** Villa-specific labels (flagship) vs generic "units". */
  villas?: boolean;
};

/** Full project page body, shared by the flagship landing and /projects/[slug]. */
export async function ProjectView({ project, models, units, faqs, properties = [], locale, h1, eyebrow, breadcrumbs, pageUrl, villas = false }: ProjectViewProps) {
  const t = await getTranslations({ locale, namespace: "project" });
  const hasUnits = units.length > 0;
  const available = hasUnits ? units.filter((u) => u.status === "available").length : null;
  const unitsCount = hasUnits ? units.length : project.total_units;
  const interest = project.name;
  const brochureHref = `/api/brochure/${slugOf(project, locale)}?locale=${locale}`;
  const media = project.media ?? [];
  const priceForCalc = project.price_from ?? models.find((m) => m.price_from)?.price_from ?? 0;
  const videos = [
    project.video_url ? { url: project.video_url, title: t("media.video") } : null,
    project.tour_url ? { url: project.tour_url, title: t("media.tour") } : null,
  ].filter((v): v is { url: string; title: string } => v !== null);

  const nav = [
    hasUnits && { id: "masterplan", label: t("sectionNav.masterplan") },
    hasUnits && { id: "disponibilidad", label: t("sectionNav.availability") },
    models.length > 0 && { id: "modelos", label: t("sectionNav.models") },
    project.amenities.length > 0 && { id: "amenidades", label: t("sectionNav.amenities") },
    { id: "ubicacion", label: t("sectionNav.location") },
    project.timeline.length > 0 && { id: "avance", label: t("sectionNav.progress") },
    { id: "planes-de-pago", label: t("sectionNav.payment") },
    { id: "documentos", label: t("sectionNav.documents") },
    faqs.length > 0 && { id: "faq", label: t("sectionNav.faq") },
    { id: "contacto", label: t("sectionNav.contact") },
  ].filter((x): x is { id: string; label: string } => !!x);

  return (
    <>
      {/* 1. Hero */}
      <section id="project-hero" className="px-2 pt-[76px] sm:px-3 lg:pt-[84px]">
        <div className="container-x pt-3 pb-4">
          <Breadcrumbs items={breadcrumbs} />
        </div>
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-[radial-gradient(120%_90%_at_78%_0%,#1d3d68_0%,#0b1f3a_52%,#06142a_100%)] text-white lg:rounded-[2.75rem]">
        <div aria-hidden className="pointer-events-none absolute -top-48 right-[-8%] -z-10 size-[40rem] rounded-full bg-gold/15 blur-3xl" />
        <div className="container-x py-10 sm:py-14 lg:py-16">
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-14">
            <div className="min-w-0">
              <Reveal y={12}>
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <p className="eyebrow inline-flex items-center gap-3 text-gold">
                    <span className="h-px w-8 bg-gold" aria-hidden />
                    {eyebrow}
                  </p>
                  <PlaceholderBadge show={project.is_placeholder} />
                </div>
              </Reveal>
              <RevealText as="h1" immediate className="text-[2.6rem] text-white sm:text-6xl xl:text-[5.4rem]">
                {h1}
              </RevealText>
              <Reveal delay={0.2}>
                <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/75 sm:text-xl">{tr(project.tagline, locale)}</p>
              </Reveal>
              <Reveal delay={0.3} className="mt-8">
                <KeyFacts project={project} unitsCount={unitsCount} available={available} unitLabel={villas ? t("hero.units") : t("hero.unitsGeneric")} locale={locale} />
              </Reveal>
              <Reveal delay={0.4} className="mt-8">
                <ProjectCtas projectId={project.id} interest={interest} />
              </Reveal>
              <Reveal delay={0.5} className="mt-6">
                <ShareButtons className="[&>span:first-child]:text-white/60" title={`${project.name} — ${tr(project.tagline, locale)}`} url={pageUrl} />
              </Reveal>
            </div>
            <Reveal delay={0.15} className="min-w-0">
              <Gallery media={media} title={project.name} />
            </Reveal>
          </div>
          <Reveal className="mt-10 max-w-3xl">
            <p className="leading-relaxed text-white/65 sm:text-lg">{tr(project.description, locale)}</p>
          </Reveal>
        </div>
        </div>
      </section>

      <SectionNav items={nav} label={t("sectionNav.label")} />

      {/* 2. Masterplan */}
      {hasUnits && (
        <ProjectSection id="masterplan" eyebrow={t("masterplan.eyebrow")} title={t("masterplan.title")} lead={t("masterplan.lead", { total: units.length })} tone="white">
          <Masterplan projectId={project.id} projectName={project.name} units={units} models={models} />
        </ProjectSection>
      )}

      {/* 3. Availability */}
      {hasUnits && (
        <ProjectSection id="disponibilidad" eyebrow={t("availability.eyebrow")} title={t("availability.title")} lead={t("availability.lead")}>
          <AvailabilityTable projectId={project.id} projectName={project.name} units={units} models={models} />
        </ProjectSection>
      )}

      {/* 4. Models */}
      {models.length > 0 && (
        <ProjectSection id="modelos" eyebrow={t("models.eyebrow")} title={t("models.title")} lead={t("models.lead")} tone="white">
          <ModelsTabs projectId={project.id} projectName={project.name} models={models} units={units} />
        </ProjectSection>
      )}

      {/* Related listings (detail pages) */}
      {properties.length > 0 && (
        <ProjectSection eyebrow={t("related.eyebrow")} title={t("related.title")} tone="sand2">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </ProjectSection>
      )}

      {/* 5. Amenities */}
      {project.amenities.length > 0 && (
        <ProjectSection id="amenidades" eyebrow={t("amenities.eyebrow")} title={t("amenities.title")} lead={t("amenities.lead")}>
          <AmenitiesGrid amenities={project.amenities} />
        </ProjectSection>
      )}

      {/* Video / virtual tour */}
      <ProjectSection eyebrow={t("media.eyebrow")} title={t("media.title")} tone="white">
        {videos.length === 0 ? (
          <Reveal>
            <VideoEmbed url={null} title={project.name} />
          </Reveal>
        ) : (
          <div className={videos.length > 1 ? "grid gap-6 lg:grid-cols-2" : ""}>
            {videos.map((v) => (
              <Reveal key={v.url}>
                <VideoEmbed url={v.url} title={`${project.name} — ${v.title}`} />
              </Reveal>
            ))}
          </div>
        )}
      </ProjectSection>

      {/* 6. Location */}
      <ProjectSection id="ubicacion" eyebrow={t("location.eyebrow")} title={project.is_flagship ? t("location.title") : project.location_name} lead={project.is_flagship ? t("location.lead") : undefined}>
        <LocationSection project={project} locale={locale} />
      </ProjectSection>

      {/* 7. Construction timeline */}
      {project.timeline.length > 0 && (
        <ProjectSection id="avance" eyebrow={t("timeline.eyebrow")} title={t("timeline.title")} lead={t("timeline.lead")} tone="white">
          <ConstructionTimeline steps={project.timeline} />
        </ProjectSection>
      )}

      {/* 8. Payment plans */}
      <ProjectSection id="planes-de-pago" eyebrow={t("payment.eyebrow")} title={t("payment.title")} lead={t("payment.lead")}>
        <PaymentPlanCards plans={project.payment_plans} price={project.price_from} locale={locale} />
        <div className="mt-10 rounded-[2rem] border border-line bg-white p-5 sm:p-8">
          <CalculatorsTabs price={priceForCalc} plans={project.payment_plans} />
        </div>
      </ProjectSection>

      {/* 9. Developer */}
      <section className="bg-sand pb-16 sm:pb-24">
        <div className="container-x">
          <Reveal>
            <DeveloperBlock project={project} locale={locale} />
          </Reveal>
        </div>
      </section>

      {/* 10. Documents */}
      <ProjectSection id="documentos" eyebrow={t("documents.eyebrow")} title={t("documents.title")} lead={t("documents.lead")} tone="white">
        <DocumentsList project={project} locale={locale} brochureHref={brochureHref} />
      </ProjectSection>

      {/* 11. FAQ */}
      {faqs.length > 0 && (
        <section id="faq" className="scroll-mt-24 bg-sand py-16 sm:py-24">
          <div className="container-x grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-16">
            <div>
              <p className="eyebrow mb-4 inline-flex items-center gap-3">
                <span className="h-px w-8 bg-gold" aria-hidden />
                {t("faq.eyebrow")}
              </p>
              <h2 className="text-[2.4rem] text-navy sm:text-6xl">{t("faq.title")}</h2>
            </div>
            <FaqAccordion faqs={faqs} />
          </div>
          <JsonLd data={faqSchema(faqs, locale)} />
        </section>
      )}

      {/* 12. Lead form */}
      <section id="contacto" className="scroll-mt-24 bg-sand-2/60 py-16 sm:py-24">
        <div className="container-x grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="eyebrow mb-4 inline-flex items-center gap-3">
              <span className="h-px w-8 bg-gold" aria-hidden />
              {t("lead.eyebrow")}
            </p>
            <h2 className="text-[2.4rem] text-navy sm:text-6xl">{t("lead.title")}</h2>
            <p className="mt-4 max-w-lg leading-relaxed text-stone sm:text-lg">{t("lead.lead")}</p>
            <ul className="mt-8 space-y-3">
              {[t("lead.point1"), t("lead.point2"), t("lead.point3")].map((p) => (
                <li key={p} className="flex items-start gap-3 font-semibold text-navy">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-gold-dark" aria-hidden />
                  {p}
                </li>
              ))}
            </ul>
            <div className="mt-8 border-t border-line pt-6">
              <p className="mb-3 text-sm text-stone">{t("lead.orWhatsapp")}</p>
              <ProjectWhatsAppLink projectId={project.id} label={t("hero.whatsapp")} />
            </div>
          </div>
          <div className="rounded-[2rem] border border-line bg-white p-5 shadow-[0_30px_80px_-40px_rgba(11,31,58,0.35)] sm:p-8">
            <LeadForm type="price" projectId={project.id} interest={interest} />
          </div>
        </div>
      </section>

      {/* 13. Sticky CTA + spacer so the mobile strip never covers the footer */}
      <StickyCta projectId={project.id} interest={interest} name={project.name} priceFrom={project.price_from} />
      <div className="h-12 md:hidden" aria-hidden />
    </>
  );
}
