import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Bath, BedDouble, Building, Check, Layers, MapPin, Ruler, Tag } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getProjects, getProperties, getPropertyBySlug } from "@/lib/data";
import { buildMetadata, localizedUrl } from "@/lib/seo";
import { propertyOfferSchema } from "@/lib/schema";
import type { Locale } from "@/lib/types";
import { slugOf, tr } from "@/lib/utils";
import { routing } from "@/i18n/routing";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/ui/JsonLd";
import { PlaceholderBadge } from "@/components/ui/PlaceholderBadge";
import { PageContext } from "@/components/layout/PageContext";
import { PropertyActions, PropertyBadges, PropertyCard } from "@/components/property/PropertyCard";
import { PropertySidebar } from "@/components/property/PropertySidebar";
import { RecentlyViewed, TrackRecent } from "@/components/search/RecentlyViewed";
import { Reveal } from "@/components/motion/Reveal";
import { LazyMap } from "@/components/map/LazyMap";
import { Gallery } from "@/components/tools/Gallery";
import { FloorplanViewer } from "@/components/tools/FloorplanViewer";
import { VideoEmbed } from "@/components/tools/VideoEmbed";
import { ShareButtons } from "@/components/tools/ShareButtons";
import { CalculatorsTabs } from "@/components/tools/CalculatorsTabs";

export const revalidate = 300;

export async function generateStaticParams() {
  const list = await getProperties();
  return routing.locales.flatMap((locale) => list.map((p) => ({ locale, slug: slugOf(p, locale) })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const p = await getPropertyBySlug(decodeURIComponent(slug), locale);
  if (!p) return {};
  return buildMetadata({
    locale,
    pathname: "/properties/[slug]",
    slugs: { es: p.slug_es, en: p.slug_en },
    title: tr(p.title, locale),
    description: tr(p.description, locale).slice(0, 158),
    seo: p.seo,
    image: p.media?.find((m) => m.is_cover)?.url ?? p.media?.[0]?.url,
  });
}

export default async function PropertyPage({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const p = await getPropertyBySlug(decodeURIComponent(slug), locale);
  if (!p) notFound();
  const [t, tc, all, projects] = await Promise.all([getTranslations("property"), getTranslations("common"), getProperties(), getProjects()]);
  const project = p.project_id ? projects.find((x) => x.id === p.project_id) : null;
  const title = tr(p.title, locale);
  const url = localizedUrl(locale, "/properties/[slug]", { es: p.slug_es, en: p.slug_en });
  const images = (p.media ?? []).filter((m) => m.kind === "image");
  const plans = (p.media ?? []).filter((m) => m.kind === "floorplan");
  const related = all
    .filter((x) => x.id !== p.id && (x.type === p.type || x.zone === p.zone))
    .slice(0, 3);
  const whatsappMessage =
    locale === "es"
      ? `Hola, me interesa la propiedad "${title}" (${url}). ¿Me pueden enviar más información?`
      : `Hi, I'm interested in the property "${title}" (${url}). Could you send me more information?`;

  const specs = [
    p.type !== "land" && { icon: BedDouble, label: tc("specs.bedroomsShort"), value: p.bedrooms },
    p.type !== "land" && { icon: Bath, label: tc("specs.bathroomsShort"), value: p.bathrooms },
    p.built_m2 > 0 && { icon: Ruler, label: tc("specs.built"), value: `${p.built_m2} m²` },
    p.lot_m2 > 0 && { icon: Layers, label: tc("specs.lot"), value: `${p.lot_m2} m²` },
    { icon: Building, label: tc("specs.type"), value: tc(`types.${p.type}`) },
    { icon: Tag, label: tc("specs.status"), value: tc(`status.${p.status}`) },
  ].filter(Boolean) as { icon: typeof Bath; label: string; value: string | number }[];

  return (
    <>
      <PageContext
        propertyId={p.id}
        projectId={p.project_id}
        interest={title}
        alternates={{ es: localizedUrl("es", "/properties/[slug]", { es: p.slug_es, en: p.slug_en }), en: localizedUrl("en", "/properties/[slug]", { es: p.slug_es, en: p.slug_en }) }}
      />
      <TrackRecent id={p.id} />
      <div className="container-x pt-28 lg:pt-32">
        <Breadcrumbs
          items={[
            { name: tc("home"), url: localizedUrl(locale, "/") },
            { name: tc("nav.properties"), url: localizedUrl(locale, "/properties") },
            { name: title, url },
          ]}
        />

        <header className="mt-6 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-3xl">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <PropertyBadges badges={p.badges} />
              <PlaceholderBadge show={p.is_placeholder} />
            </div>
            <h1 className="text-[2.4rem] text-navy sm:text-5xl lg:text-6xl">{title}</h1>
            <p className="mt-3 flex items-center gap-2 text-stone">
              <MapPin className="size-4 text-gold-dark" aria-hidden />
              {p.zone}, Punta Cana
              {project && (
                <>
                  <span aria-hidden>·</span>
                  <span>
                    {t("partOf")}{" "}
                    {project.is_flagship ? (
                      <Link href="/villas-macao" className="font-semibold text-navy underline underline-offset-4">
                        {project.name}
                      </Link>
                    ) : (
                      <Link href={{ pathname: "/projects/[slug]", params: { slug: slugOf(project, locale) } }} className="font-semibold text-navy underline underline-offset-4">
                        {project.name}
                      </Link>
                    )}
                  </span>
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <PropertyActions id={p.id} />
            <ShareButtons title={title} url={url} />
          </div>
        </header>

        <div className="mt-8">
          <Gallery media={images} title={title} />
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0 space-y-16">
            <Reveal as="section">
              <h2 className="mb-6 text-4xl">{t("specs")}</h2>
              <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {specs.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rounded-2xl border border-line bg-white p-4">
                    <Icon className="size-5 text-gold-dark" aria-hidden />
                    <dt className="mt-3 text-xs font-semibold tracking-wide text-stone uppercase">{label}</dt>
                    <dd className="mt-0.5 text-lg font-bold">{value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal as="section">
              <h2 className="mb-4 text-4xl">{t("overview")}</h2>
              <div className="prose-perdomo whitespace-pre-line">{tr(p.description, locale)}</div>
            </Reveal>

            {p.amenities.length > 0 && (
              <Reveal as="section">
                <h2 className="mb-6 text-4xl">{t("amenities")}</h2>
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {p.amenities.map((a) => (
                    <li key={a} className="flex items-center gap-2 text-sm font-semibold">
                      <span className="grid size-7 place-items-center rounded-full bg-gold-soft text-gold-dark">
                        <Check className="size-3.5" aria-hidden />
                      </span>
                      {tc(`amenities.${a}`)}
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}

            <Reveal as="section">
              <h2 className="mb-6 text-4xl">{t("tour")}</h2>
              <VideoEmbed url={p.tour_url || p.video_url} title={title} />
            </Reveal>

            {plans.length > 0 && (
              <Reveal as="section">
                <h2 className="mb-6 text-4xl">{t("floorplans")}</h2>
                <FloorplanViewer plans={plans} title={title} />
              </Reveal>
            )}

            <Reveal as="section">
              <h2 className="mb-2 text-4xl">{t("location")}</h2>
              <p className="mb-5 text-sm text-stone">{t("approxLocation")}</p>
              <div className="h-[360px] overflow-hidden rounded-[1.75rem] border border-line sm:h-[440px]">
                <LazyMap markers={[{ id: p.id, lat: p.lat, lng: p.lng, label: p.zone }]} center={[p.lat, p.lng]} zoom={13} />
              </div>
            </Reveal>

            {p.price && (
              <Reveal as="section">
                <h2 className="mb-6 text-4xl">{t("calculators")}</h2>
                <CalculatorsTabs price={p.price} plans={project?.payment_plans ?? []} />
              </Reveal>
            )}
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <PropertySidebar price={p.price} propertyId={p.id} projectId={p.project_id} interest={title} whatsappMessage={whatsappMessage} />
          </aside>
        </div>

        {related.length > 0 && (
          <section className="mt-24" aria-labelledby="related-title">
            <h2 id="related-title" className="mb-8 text-5xl">
              {t("related")}
            </h2>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <li key={r.id}>
                  <PropertyCard property={r} />
                </li>
              ))}
            </ul>
          </section>
        )}
        <RecentlyViewed properties={all} excludeId={p.id} className="mt-20" />
      </div>
      <JsonLd data={propertyOfferSchema(p, locale, url)} />
    </>
  );
}
