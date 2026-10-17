import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getPosts } from "@/lib/data";
import { buildMetadata, localizedUrl } from "@/lib/seo";
import type { Locale } from "@/lib/types";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PostCard } from "@/components/blog/PostCard";
import { BlogList } from "@/components/blog/BlogList";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.blog" });
  return buildMetadata({ locale, pathname: "/blog", title: t("metaTitle"), description: t("metaDescription") });
}

export default async function BlogPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tc, posts] = await Promise.all([getTranslations("pages.blog"), getTranslations("common"), getPosts()]);
  const cards = Object.fromEntries(posts.map((p) => [p.id, <PostCard key={p.id} post={p} locale={locale} />]));
  return (
    <div className="container-x pt-28 lg:pt-32">
      <Breadcrumbs items={[{ name: tc("home"), url: localizedUrl(locale, "/") }, { name: "Blog", url: localizedUrl(locale, "/blog") }]} />
      <SectionHeading as="h1" immediate eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} className="mt-6 mb-12" />
      <BlogList posts={posts} cards={cards} locale={locale} />
    </div>
  );
}
