import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { requireStaff } from "@/lib/admin/auth";
import { postToForm } from "@/lib/admin/defaults";
import { deletePost } from "@/app/admin/_actions/posts";
import { PageHeader, PublishedPill, Section } from "@/components/admin/ui";
import { PostForm } from "@/components/admin/PostForm";
import { MediaManager } from "@/components/admin/MediaManager";
import { ConfirmActionButton } from "@/components/admin/InlineActions";
import type { MediaItem, Post } from "@/lib/types";

export const metadata: Metadata = { title: "Editar artículo" };

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await requireStaff();
  const [{ data }, { data: media }] = await Promise.all([
    supabase.from("posts").select("*").eq("id", id).maybeSingle(),
    supabase.from("media").select("*").eq("owner_type", "post").eq("owner_id", id).order("sort"),
  ]);
  if (!data) notFound();
  const post = data as Post;
  const title = post.title?.es || post.title?.en || "Artículo";

  return (
    <>
      <PageHeader
        title={title}
        back={{ href: "/admin/blog", label: "Blog" }}
        description={<PublishedPill published={post.published} />}
        actions={
          <a href={`/es/blog/${post.slug_es}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
            <ExternalLink className="size-4" /> Ver
          </a>
        }
      />
      <div className="space-y-5">
        <PostForm id={id} initial={postToForm(post)} />
        <Section title="Galería del artículo" description="Imágenes adicionales (opcional). Copia su URL para usarlas como portada.">
          <MediaManager ownerType="post" ownerId={id} initialItems={(media ?? []) as MediaItem[]} title="Imágenes" />
        </Section>
        <Section title="Zona de peligro" className="border-red-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-stone">El artículo se eliminará de forma permanente.</p>
            <ConfirmActionButton action={deletePost.bind(null, id)} confirmText={`¿Eliminar “${title}”?`} label="Eliminar artículo" />
          </div>
        </Section>
      </div>
    </>
  );
}
