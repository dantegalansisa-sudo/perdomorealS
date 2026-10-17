import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import sanitizeHtml from "sanitize-html";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getPostBySlug, getPosts } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { blogPostingSchema } from "@/lib/schema";
import { buildMetadata, localizedUrl } from "@/lib/seo";
import type { Locale } from "@/lib/types";
import { slugOf, tr } from "@/lib/utils";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/ui/JsonLd";
import { ImagePlaceholder } from "@/components/ui/Media";
import { PlaceholderBadge } from "@/components/ui/PlaceholderBadge";
import { PageContext } from "@/components/layout/PageContext";
import { PostCard, readingMinutes } from "@/components/blog/PostCard";
import { OpenLeadButton } from "@/components/forms/OpenLeadButton";
import { ShareButtons } from "@/components/tools/ShareButtons";

export const revalidate = 300;

export async function generateStaticParams() {
  const posts = await getPosts();
  return routing.locales.flatMap((locale) => posts.map((p) => ({ locale, slug: slugOf(p, locale) })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPostBySlug(decodeURIComponent(slug), locale);
  if (!post) return {};
  return buildMetadata({
    locale,
    pathname: "/blog/[slug]",
    slugs: { es: post.slug_es, en: post.slug_en },
    title: tr(post.title, locale),
    description: tr(post.excerpt, locale),
    seo: post.seo,
    image: post.cover_url,
    type: "article",
  });
}

const SANITIZE: sanitizeHtml.IOptions = {
  allowedTags: ["h2", "h3", "h4", "p", "a", "ul", "ol", "li", "strong", "em", "b", "i", "blockquote", "br", "hr", "img", "figure", "figcaption"],
  allowedAttributes: { a: ["href", "target", "rel"], img: ["src", "alt", "width", "height"] },
  transformTags: { a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }) },
};

export default async function PostPage({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const post = await getPostBySlug(decodeURIComponent(slug), locale);
  if (!post) notFound();
  const [t, tc, posts] = await Promise.all([getTranslations("pages.blog"), getTranslations("common"), getPosts()]);
  const url = localizedUrl(locale, "/blog/[slug]", { es: post.slug_es, en: post.slug_en });
  const title = tr(post.title, locale);
  const html = sanitizeHtml(tr(post.content, locale), SANITIZE);
  const related = posts.filter((p) => p.id !== post.id).slice(0, 3);

  return (
    <article className="pt-28 lg:pt-32">
      <PageContext
        interest={title}
        alternates={{ es: localizedUrl("es", "/blog/[slug]", { es: post.slug_es, en: post.slug_en }), en: localizedUrl("en", "/blog/[slug]", { es: post.slug_es, en: post.slug_en }) }}
      />
      <div className="container-x max-w-4xl">
        <Breadcrumbs
          items={[
            { name: tc("home"), url: localizedUrl(locale, "/") },
            { name: "Blog", url: localizedUrl(locale, "/blog") },
            { name: title, url },
          ]}
        />
        <header className="mt-8">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-stone">
            <span className="tracking-wider text-gold-dark uppercase">{t(`categories.${post.category}` as never)}</span>
            <span aria-hidden>·</span>
            <time dateTime={post.published_at}>{formatDate(post.published_at, locale)}</time>
            <span aria-hidden>·</span>
            <span>{tc("minRead", { count: readingMinutes(tr(post.content, locale)) })}</span>
            <PlaceholderBadge show={post.is_placeholder} />
          </div>
          <h1 className="mt-4 text-[2.4rem] text-navy sm:text-6xl">{title}</h1>
          <p className="mt-5 text-lg leading-relaxed text-stone">{tr(post.excerpt, locale)}</p>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-line py-4">
            <p className="text-sm">
              {t("by")} <span className="font-bold">{post.author}</span>
            </p>
            <ShareButtons title={title} url={url} />
          </div>
        </header>
      </div>
      <div className="container-x mt-10 max-w-5xl">
        <div className="overflow-hidden rounded-[2rem]">
          {post.cover_url ? (
            <div className="relative aspect-video">
              <Image src={post.cover_url} alt="" fill priority sizes="(min-width:1024px) 1000px, 100vw" className="object-cover" />
            </div>
          ) : (
            <ImagePlaceholder ratio="16/9" />
          )}
        </div>
      </div>
      <div className="container-x mt-12 max-w-3xl">
        <div className="prose-perdomo" dangerouslySetInnerHTML={{ __html: html }} />
        <div className="mt-14 rounded-[2rem] bg-navy p-8 text-white sm:p-10">
          <p className="font-display text-4xl">{t("ctaTitle")}</p>
          <p className="mt-2 text-white/70">{t("ctaText")}</p>
          <OpenLeadButton type="info" interest={title} className="btn btn-gold mt-6">
            {tc("ctaConsult")}
          </OpenLeadButton>
        </div>
        <Link href="/blog" className="mt-10 inline-flex items-center gap-2 text-sm font-bold hover:text-gold-dark">
          <ArrowLeft className="size-4" aria-hidden /> {t("back")}
        </Link>
      </div>
      {related.length > 0 && (
        <section className="container-x mt-24" aria-labelledby="rel-title">
          <h2 id="rel-title" className="mb-10 text-5xl">
            {t("related")}
          </h2>
          <ul className="grid gap-8 md:grid-cols-3">
            {related.map((p) => (
              <li key={p.id}>
                <PostCard post={p} locale={locale} />
              </li>
            ))}
          </ul>
        </section>
      )}
      <JsonLd data={blogPostingSchema(post, locale, url)} />
    </article>
  );
}
