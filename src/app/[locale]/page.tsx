import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, ArrowUpRight, Building2, Compass, FileCheck2, Globe2, HeartHandshake, Home, KeyRound, Landmark, Mountain, Plane, Sparkles, Sun, Trees, Umbrella, Users } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { StaticPathname } from "@/i18n/routing";
import { getFaqs, getFlagshipProject, getPosts, getProjects, getProperties, getSettings, getUnits, getModels } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";
import { faqSchema } from "@/lib/schema";
import type { Locale } from "@/lib/types";
import { slugOf, tr } from "@/lib/utils";
import { Hero } from "@/components/home/Hero";
import { FeaturedProject } from "@/components/home/FeaturedProject";
import { PropertyCarousel } from "@/components/home/Carousel";
import { ContactWhatsApp, HomeMap, StatsBar } from "@/components/home/HomeClient";
import { PostCard } from "@/components/blog/PostCard";
import { ProjectCard } from "@/components/project/ProjectCard";
import { TitleInHandBand } from "@/components/sections/TitleInHand";
import { LeadForm } from "@/components/forms/LeadForm";
import { FaqAccordion } from "@/components/sections/FaqAccordion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PlaceholderBadge } from "@/components/ui/PlaceholderBadge";
import { JsonLd } from "@/components/ui/JsonLd";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
import { PaymentPlanCalculator } from "@/components/tools/PaymentPlanCalculator";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home.meta" });
  return buildMetadata({ locale, pathname: "/", title: t("title"), description: t("description") });
}

const HERO_VILLA = path.join(process.cwd(), "public", "images", "hero-villa.webp");

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const tc = await getTranslations("common");

  const [settings, flagship, properties, posts, faqs, projects] = await Promise.all([getSettings(), getFlagshipProject(), getProperties(), getPosts(), getFaqs(null), getProjects()]);
  const [units, models] = flagship ? await Promise.all([getUnits(flagship.id), getModels(flagship.id)]) : [[], []];

  const zones = [...new Set([...properties.map((p) => p.zone), ...projects.map((p) => p.zone)])].filter(Boolean).sort();
  const villaSrc = fs.existsSync(HERO_VILLA) ? "/images/hero-villa.webp" : null;
  const featuredProps = properties.filter((p) => p.featured);
  const otherProjects = projects.filter((p) => !p.is_flagship);
  const available = units.filter((u) => u.status === "available").length;
  const maxBuilt = Math.max(0, ...models.map((m) => m.built_m2));
  const beachMinutes = flagship?.distances.find((d) => /macao|playa|beach/i.test(d.label.en))?.minutes ?? 5;
  const deliveryYear = flagship?.delivery_date ? new Date(flagship.delivery_date).getFullYear() : null;

  const countBy = (type: string) => properties.filter((p) => p.type === type).length;
  const categories: { href: StaticPathname; label: string; count: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { href: "/villas", label: tc("categories.villas"), count: t("categories.count", { count: countBy("villa") + countBy("house") }), icon: Home },
    { href: "/apartments", label: tc("categories.apartments"), count: t("categories.count", { count: countBy("apartment") }), icon: Building2 },
    { href: "/houses", label: tc("categories.houses"), count: t("categories.count", { count: countBy("house") }), icon: Landmark },
    { href: "/land", label: tc("categories.land"), count: t("categories.count", { count: countBy("land") }), icon: Mountain },
    { href: "/projects", label: tc("categories.projects"), count: t("categories.projectsCount", { count: projects.length }), icon: Compass },
  ];

  const why = [
    { k: "curated", icon: Sparkles },
    { k: "bilingual", icon: Globe2 },
    { k: "remote", icon: Plane },
    { k: "legal", icon: FileCheck2 },
    { k: "transparent", icon: Users },
    { k: "after", icon: HeartHandshake },
  ] as const;

  const markers = [
    ...projects.map((p) => ({ id: p.id, lat: p.lat, lng: p.lng, label: p.name })),
    { id: "poi-airport", lat: 18.5674, lng: -68.3634, label: "✈ PUJ", popup: t("location.points.airport") },
    { id: "poi-macao", lat: 18.7705, lng: -68.5425, label: `☀ ${t("location.points.macao")}` },
    { id: "poi-bavaro", lat: 18.6905, lng: -68.4335, label: t("location.points.bavaro") },
    { id: "poi-capcana", lat: 18.4805, lng: -68.3705, label: t("location.points.capcana") },
  ];

  return (
    <>
      <Hero title={tr(settings.hero.title, locale)} subtitle={tr(settings.hero.subtitle, locale)} zones={zones} villaSrc={villaSrc} />

      {/* Key trust message from the client: titled properties, title handed over at closing */}
      <section className="container-x py-12 sm:py-16">
        <TitleInHandBand />
      </section>

      {/* 2. Featured project — pinned scroll story */}
      {flagship && <FeaturedProject priceFrom={flagship.price_from} statuses={units.map((u) => u.status)} isPlaceholder={flagship.is_placeholder} villaSrc={villaSrc} aerialSrc="/images/villas/ubicacion-playa-macao.webp" />}

      {/* 3. Animated figures */}
      {flagship && (
        <section className="container-x py-10" aria-label={t("featured.title")}>
          <Reveal>
            <StatsBar
              locale={locale}
              stats={[
                { value: available, label: t("stats.available") },
                { value: models.length, label: t("stats.models") },
                { value: beachMinutes, label: t("stats.beach") },
                { value: maxBuilt, label: t("stats.built") },
                ...(deliveryYear ? [{ value: deliveryYear, label: t("stats.delivery"), plain: true }] : []),
              ]}
            />
            <PlaceholderBadge show={flagship.is_placeholder} className="mt-3" />
          </Reveal>
        </section>
      )}

      {/* 3b. Other projects */}
      {otherProjects.length > 0 && (
        <section className="bg-sand-2 py-24">
          <div className="container-x">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading eyebrow={t("projects.eyebrow")} title={t("projects.title")} lead={t("projects.lead")} />
              <Link href="/projects" className="btn btn-navy">
                {t("projects.all")} <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
            <Stagger className="mt-12 grid gap-6 md:grid-cols-2">
              {otherProjects.map((p) => (
                <StaggerItem key={p.id}>
                  <ProjectCard project={p} locale={locale} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      {/* 4. Categories */}
      <section className="container-x py-24">
        <SectionHeading eyebrow={t("categories.eyebrow")} title={t("categories.title")} />
        <Stagger className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
          {categories.map(({ href, label, count, icon: Icon }, i) => (
            <StaggerItem key={href} className={i === 4 ? "col-span-2 lg:col-span-1" : ""}>
              <Link
                href={href}
                className="group relative flex h-full min-h-44 flex-col justify-between overflow-hidden rounded-[1.75rem] border border-line bg-white p-5 transition-colors duration-500 hover:border-navy hover:bg-navy sm:min-h-56 sm:p-6"
              >
                <span className="grid size-12 place-items-center rounded-full bg-sand text-gold-dark transition-colors duration-500 group-hover:bg-white/10 group-hover:text-gold">
                  <Icon className="size-5" />
                </span>
                <span>
                  <span className="font-display block text-3xl text-navy transition-colors duration-500 group-hover:text-white sm:text-4xl">{label}</span>
                  <span className="mt-1 flex items-center justify-between text-sm text-stone transition-colors duration-500 group-hover:text-white/70">
                    {count}
                    <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                  </span>
                </span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* 5. Featured properties */}
      <section className="bg-sand-2 py-24">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading eyebrow={t("properties.eyebrow")} title={t("properties.title")} lead={t("properties.lead")} />
            <Link href="/properties" className="btn btn-ghost">
              {tc("viewAll")} <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <div className="mt-6">
            <PropertyCarousel properties={featuredProps.length ? featuredProps : properties.slice(0, 6)} />
          </div>
        </div>
      </section>

      {/* 6. Why Perdomo */}
      <section className="container-x py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading eyebrow={t("why.eyebrow")} title={t("why.title")} />
            <Parallax distance={30} className="mt-10 hidden overflow-hidden rounded-[2rem] lg:block">
              <div className="relative aspect-[4/3] bg-navy text-white">
                <Image src="/images/villas/calle-principio-village.webp" alt={t("why.imageAlt")} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/90 to-transparent p-6">
                  <p className="font-display text-4xl">Punta Cana</p>
                  <p className="mt-1 text-sm text-white/70">Macao · Bávaro · Cap Cana</p>
                </div>
              </div>
            </Parallax>
          </div>
          <Stagger className="grid gap-4 sm:grid-cols-2">
            {why.map(({ k, icon: Icon }) => (
              <StaggerItem key={k} className="card p-7 transition-shadow duration-500 hover:shadow-[0_24px_50px_-30px_rgba(11,31,58,0.35)]">
                <Icon className="size-7 text-gold-dark" aria-hidden />
                <h3 className="mt-6 font-sans text-xl font-bold tracking-normal normal-case">{t(`why.items.${k}.title`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone">{t(`why.items.${k}.text`)}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* 7. Buying process */}
      <section className="relative overflow-hidden bg-navy py-24 text-white">
        <div aria-hidden className="absolute -top-40 -right-40 size-[30rem] rounded-full bg-gold/10 blur-3xl" />
        <div className="container-x relative">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-end">
            <div>
              <p className="eyebrow mb-4 flex items-center gap-3 text-gold">
                <span className="h-px w-8 bg-gold" aria-hidden />
                {t("process.eyebrow")}
              </p>
              <h2 className="text-[2.6rem] sm:text-6xl lg:text-7xl">{t("process.title")}</h2>
            </div>
            <div>
              <p className="text-lg text-white/70">{t("process.lead")}</p>
              <p className="mt-4 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                <Globe2 className="mt-0.5 size-5 shrink-0 text-gold" aria-hidden />
                {t("process.international")}
              </p>
            </div>
          </div>
          <Stagger as="ol" className="mt-16 grid gap-px overflow-hidden rounded-[2rem] bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {(["1", "2", "3", "4", "5", "6"] as const).map((n) => (
              <StaggerItem as="li" key={n} className="bg-navy p-7 lg:p-9">
                <span className="font-display text-6xl text-gold/90">0{n}</span>
                <h3 className="mt-4 font-sans text-xl font-bold tracking-normal normal-case">{t(`process.steps.${n}.title`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/65">{t(`process.steps.${n}.text`)}</p>
              </StaggerItem>
            ))}
          </Stagger>
          <div className="mt-10 flex items-center gap-3 text-sm text-white/60">
            <KeyRound className="size-4 text-gold" aria-hidden />
            Perdomo Real Estate
          </div>
        </div>
      </section>

      {/* 8. Payment plan calculator preview */}
      {flagship && (
        <section className="bg-sand-2 py-24">
          <div className="container-x grid items-center gap-12 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <SectionHeading eyebrow={t("calculator.eyebrow")} title={t("calculator.title")} lead={t("calculator.lead")} />
              <Reveal delay={0.2}>
                <Link href="/villas-macao" className="btn btn-navy mt-8">
                  {t("calculator.cta")} <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Reveal>
            </div>
            <Reveal>
              <PaymentPlanCalculator price={flagship.price_from ?? 250000} plans={flagship.payment_plans} compact />
            </Reveal>
          </div>
        </section>
      )}

      {/* 9. Location */}
      <section className="py-24">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <SectionHeading eyebrow={t("location.eyebrow")} title={t("location.title")} lead={t("location.lead")} />
            <Stagger as="ul" className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {([
                { k: "airport", icon: Plane },
                { k: "beach", icon: Umbrella },
                { k: "tourism", icon: Sun },
                { k: "lifestyle", icon: Trees },
              ] as const).map(({ k, icon: Icon }) => (
                <StaggerItem as="li" key={k} className="flex gap-4 rounded-2xl border border-line bg-sand p-5">
                  <Icon className="mt-0.5 size-5 shrink-0 text-gold-dark" aria-hidden />
                  <div>
                    <p className="font-bold">{t(`location.advantages.${k}.title`)}</p>
                    <p className="mt-1 text-sm text-stone">{t(`location.advantages.${k}.text`)}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
          <Reveal className="h-[420px] overflow-hidden rounded-[2rem] border border-line sm:h-[520px] lg:h-full lg:min-h-[560px]">
            <HomeMap markers={markers} />
          </Reveal>
        </div>
      </section>

      {/* 10. Blog */}
      {posts.length > 0 && (
        <section className="bg-sand-2 py-24">
         <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading eyebrow={t("blog.eyebrow")} title={t("blog.title")} />
            <Link href="/blog" className="btn btn-ghost">
              {t("blog.all")} <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <Stagger className="mt-12 grid gap-8 md:grid-cols-3">
            {posts.slice(0, 3).map((p) => (
              <StaggerItem key={p.id}>
                <PostCard post={p} locale={locale} />
              </StaggerItem>
            ))}
          </Stagger>
         </div>
        </section>
      )}

      {/* 11. FAQ */}
      {faqs.length > 0 && (
        <section className="container-x py-24">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
            <SectionHeading eyebrow={t("faq.eyebrow")} title={t("faq.title")} />
            <Reveal>
              <FaqAccordion faqs={faqs} />
            </Reveal>
          </div>
          <JsonLd data={faqSchema(faqs, locale)} />
        </section>
      )}

      {/* 12. Lead capture */}
      <section id="contacto" className="relative overflow-hidden bg-navy py-20 lg:py-24">
        <div aria-hidden className="absolute -top-40 left-[-10%] size-[32rem] rounded-full bg-gold/10 blur-3xl" />
        <div className="container-x relative">
        <div className="grid gap-10 overflow-hidden rounded-[2.5rem] bg-white p-6 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.6)] sm:p-10 lg:grid-cols-[1fr_1.2fr] lg:p-14">
          <div>
            <SectionHeading eyebrow={t("contact.eyebrow")} title={t("contact.title")} lead={t("contact.lead")} titleClassName="lg:text-6xl" />
            <div className="mt-8 rounded-2xl bg-sand p-5">
              <p className="text-sm font-semibold text-navy-soft">{t("contact.orWhatsapp")}</p>
              <div className="mt-3">
                <ContactWhatsApp />
              </div>
            </div>
            {flagship && (
              <p className="mt-6 text-sm text-stone">
                <Link href="/villas-macao" className="underline underline-offset-4 hover:text-gold-dark">
                  {flagship.name}
                </Link>
              </p>
            )}
          </div>
          <LeadForm />
        </div>
        </div>
      </section>
    </>
  );
}
