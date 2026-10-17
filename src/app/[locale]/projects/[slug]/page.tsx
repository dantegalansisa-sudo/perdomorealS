import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import { PageContext } from "@/components/layout/PageContext";
import { ProjectView } from "@/components/project/ProjectView";
import { coverOf } from "@/components/ui/Media";
import { getFaqs, getModels, getProjectBySlug, getProjects, getProperties, getUnits } from "@/lib/data";
import { buildMetadata, localizedUrl } from "@/lib/seo";
import type { Locale } from "@/lib/types";
import { slugOf, tr } from "@/lib/utils";

export const revalidate = 300;

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const projects = await getProjects();
  return projects.filter((p) => !p.is_flagship).map((p) => ({ slug: slugOf(p, params.locale) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = await getProjectBySlug(slug, locale);
  if (!project) return {};
  const l = locale as Locale;
  if (project.is_flagship) return buildMetadata({ locale: l, pathname: "/villas-macao", title: project.name, description: tr(project.tagline, l), seo: project.seo });
  const t = await getTranslations({ locale, namespace: "project.meta" });
  return buildMetadata({
    locale: l,
    pathname: "/projects/[slug]",
    slugs: { es: project.slug_es, en: project.slug_en },
    title: t("detailTitle", { name: project.name, zone: project.zone }),
    description: `${tr(project.tagline, l)}. ${tr(project.description, l)}`.slice(0, 158),
    seo: project.seo,
    image: coverOf(project.media)?.url ?? null,
  });
}

export default async function ProjectDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;
  const project = await getProjectBySlug(slug, locale);
  if (!project) notFound();
  if (project.is_flagship) permanentRedirect(getPathname({ locale: l, href: "/villas-macao" }));

  const [models, units, faqs, allProperties, t, tc] = await Promise.all([
    getModels(project.id),
    getUnits(project.id),
    getFaqs(project.id),
    getProperties(),
    getTranslations({ locale, namespace: "project" }),
    getTranslations({ locale, namespace: "common" }),
  ]);
  const properties = allProperties.filter((p) => p.project_id === project.id);
  const slugs = { es: project.slug_es, en: project.slug_en };
  const pageUrl = localizedUrl(l, "/projects/[slug]", slugs);

  return (
    <>
      <PageContext
        projectId={project.id}
        interest={project.name}
        alternates={{ es: localizedUrl("es", "/projects/[slug]", slugs), en: localizedUrl("en", "/projects/[slug]", slugs) }}
      />
      <ProjectView
        project={project}
        models={models}
        units={units}
        faqs={faqs}
        properties={properties}
        locale={l}
        h1={project.name}
        eyebrow={t("detail.eyebrow", { zone: project.zone, status: tc(`status.${project.status}`) })}
        pageUrl={pageUrl}
        breadcrumbs={[
          { name: tc("home"), url: localizedUrl(l, "/") },
          { name: t("breadcrumbs.projects"), url: localizedUrl(l, "/projects") },
          { name: project.name, url: pageUrl },
        ]}
      />
    </>
  );
}
