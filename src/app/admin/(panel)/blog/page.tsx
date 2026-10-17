import type { Metadata } from "next";
import Link from "next/link";
import { Newspaper, Plus } from "lucide-react";
import { requireStaff } from "@/lib/admin/auth";
import { togglePostPublished } from "@/app/admin/_actions/posts";
import { POST_CATEGORIES } from "@/lib/admin/constants";
import { EmptyState, PageHeader, PlaceholderPill, TableWrap, td, th } from "@/components/admin/ui";
import { InlineToggle } from "@/components/admin/InlineActions";
import { ProjectPicker } from "@/components/admin/ProjectPicker";
import type { Post } from "@/lib/types";

export const metadata: Metadata = { title: "Blog" };

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const { supabase } = await requireStaff();
  const { cat } = await searchParams;
  let q = supabase.from("posts").select("id,title,category,cover_url,author,published,published_at,is_placeholder").order("published_at", { ascending: false });
  if (cat && cat in POST_CATEGORIES) q = q.eq("category", cat);
  const { data } = await q;
  const posts = (data ?? []) as Pick<Post, "id" | "title" | "category" | "cover_url" | "author" | "published" | "published_at" | "is_placeholder">[];

  return (
    <>
      <PageHeader
        title="Blog"
        description="Guías, noticias y contenido para SEO."
        actions={
          <>
            <ProjectPicker
              param="cat"
              value={cat ?? ""}
              allLabel="Todas las categorías"
              projects={Object.entries(POST_CATEGORIES).map(([id, name]) => ({ id, name }))}
            />
            <Link href="/admin/blog/nuevo" className="btn btn-gold btn-sm">
              <Plus className="size-4" /> Nuevo artículo
            </Link>
          </>
        }
      />
      {posts.length === 0 ? (
        <EmptyState icon={<Newspaper className="size-5" />} title="No hay artículos">
          Escribe tu primer artículo del blog.
        </EmptyState>
      ) : (
        <TableWrap>
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-line bg-sand/60">
              <tr>
                <th className={th}>Artículo</th>
                <th className={th}>Categoría</th>
                <th className={th}>Fecha</th>
                <th className={th}>Publicado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {posts.map((p) => (
                <tr key={p.id} className="hover:bg-sand/40">
                  <td className={td}>
                    <Link href={`/admin/blog/${p.id}`} className="flex items-center gap-3">
                      <span className="h-12 w-16 shrink-0 overflow-hidden rounded-xl bg-sand-2">
                        {p.cover_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.cover_url} alt="" className="size-full object-cover" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-2 font-bold text-navy hover:text-gold-dark">
                          <span className="max-w-[340px] truncate">{p.title?.es || p.title?.en || "Sin título"}</span>
                          {p.is_placeholder && <PlaceholderPill />}
                        </span>
                        <span className="text-xs text-stone">{p.author}</span>
                      </span>
                    </Link>
                  </td>
                  <td className={td}>{POST_CATEGORIES[p.category] ?? p.category}</td>
                  <td className={`${td} whitespace-nowrap`}>{new Date(p.published_at).toLocaleDateString("es-DO", { day: "numeric", month: "short", year: "numeric" })}</td>
                  <td className={td}>
                    <InlineToggle initial={p.published} action={togglePostPublished.bind(null, p.id)} label="Publicado" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}
    </>
  );
}
