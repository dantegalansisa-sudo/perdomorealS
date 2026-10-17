import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ImagePlaceholder } from "@/components/ui/Media";
import { PlaceholderBadge } from "@/components/ui/PlaceholderBadge";
import { formatDate } from "@/lib/format";
import type { Locale, Post } from "@/lib/types";
import { slugOf, tr } from "@/lib/utils";
import Image from "next/image";

export function readingMinutes(html: string) {
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.round(words / 200));
}

export function PostCard({ post, locale }: { post: Post; locale: Locale }) {
  const t = useTranslations("common");
  const tb = useTranslations("pages.blog");
  return (
    <article className="group relative flex flex-col">
      <div className="overflow-hidden rounded-[1.5rem]">
        {post.cover_url ? (
          <div className="relative aspect-video">
            <Image src={post.cover_url} alt="" fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
          </div>
        ) : (
          <ImagePlaceholder ratio="16/9" className="transition-transform duration-700 group-hover:scale-105" />
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-stone">
        <span className="tracking-wider text-gold-dark uppercase">{tb(`categories.${post.category}` as never)}</span>
        <span aria-hidden>·</span>
        <time dateTime={post.published_at}>{formatDate(post.published_at, locale, { dateStyle: "medium" })}</time>
        <span aria-hidden>·</span>
        <span>{t("minRead", { count: readingMinutes(tr(post.content, locale)) })}</span>
        <PlaceholderBadge show={post.is_placeholder} />
      </div>
      <h3 className="mt-2 font-sans text-xl leading-snug font-bold tracking-normal normal-case">
        <Link href={{ pathname: "/blog/[slug]", params: { slug: slugOf(post, locale) } }} className="after:absolute after:inset-0 group-hover:text-gold-dark">
          {tr(post.title, locale)}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone">{tr(post.excerpt, locale)}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-navy">
        {t("readMore")} <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
      </span>
    </article>
  );
}
