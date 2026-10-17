import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageContext } from "@/components/layout/PageContext";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { ProjectCard } from "@/components/project/ProjectCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getProjects } from "@/lib/data";
import { buildMetadata, localizedUrl } from "@/lib/seo";
import type { Locale } from "@/lib/types";

export const revalidate = 300;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "project.meta" });
  return buildMetadata({ locale: locale as Locale, pathname: "/projects", title: t("listTitle"), description: t("listDescription") });
}

export default async function ProjectsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;
  const [projects, t, tc] = await Promise.all([getProjects(), getTranslations({ locale, namespace: "project.list" }), getTranslations({ locale, namespace: "common" })]);
  const sorted = [...projects].sort((a, b) => Number(b.is_flagship) - Number(a.is_flagship) || a.sort - b.sort);

  return (
    <>
      <PageContext alternates={{ es: localizedUrl("es", "/projects"), en: localizedUrl("en", "/projects") }} />
      <section className="bg-sand pt-28 pb-20 sm:pt-32 sm:pb-28">
        <div className="container-x">
          <Breadcrumbs
            className="mb-8"
            items={[
              { name: tc("home"), url: localizedUrl(l, "/") },
              { name: tc("nav.projects"), url: localizedUrl(l, "/projects") },
            ]}
          />
          <SectionHeading as="h1" immediate eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
          {sorted.length === 0 ? (
            <p className="mt-14 rounded-3xl border border-dashed border-line bg-white p-10 text-center text-stone">{t("empty")}</p>
          ) : (
            <Stagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sorted.map((p, i) => (
                <StaggerItem key={p.id} className="h-full">
                  <ProjectCard project={p} locale={l} priority={i < 2} />
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </div>
      </section>
    </>
  );
}
