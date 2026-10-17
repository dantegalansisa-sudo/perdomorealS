import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageContext } from "@/components/layout/PageContext";
import { ProjectView } from "@/components/project/ProjectView";
import { coverOf } from "@/components/ui/Media";
import { getFaqs, getFlagshipProject, getModels, getUnits } from "@/lib/data";
import { buildMetadata, localizedUrl } from "@/lib/seo";
import type { Locale } from "@/lib/types";

export const revalidate = 300;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const l = locale as Locale;
  const [t, project] = await Promise.all([getTranslations({ locale, namespace: "project.meta" }), getFlagshipProject()]);
  return buildMetadata({
    locale: l,
    pathname: "/villas-macao",
    title: t("landingTitle"),
    description: t("landingDescription"),
    seo: project?.seo,
    image: coverOf(project?.media)?.url ?? null,
  });
}

export default async function VillasMacaoPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;
  const project = await getFlagshipProject();
  if (!project) notFound();
  const [models, units, faqs, t, tc] = await Promise.all([
    getModels(project.id),
    getUnits(project.id),
    getFaqs(project.id),
    getTranslations({ locale, namespace: "project" }),
    getTranslations({ locale, namespace: "common" }),
  ]);
  const pageUrl = localizedUrl(l, "/villas-macao");

  return (
    <>
      <PageContext projectId={project.id} interest={project.name} alternates={{ es: localizedUrl("es", "/villas-macao"), en: localizedUrl("en", "/villas-macao") }} />
      <ProjectView
        project={project}
        models={models}
        units={units}
        faqs={faqs}
        locale={l}
        villas
        h1={t("landing.h1")}
        eyebrow={t("landing.eyebrow", { zone: project.zone })}
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
