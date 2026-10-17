"use server";
import { redirect } from "next/navigation";
import sanitizeHtml from "sanitize-html";
import { actionContext } from "@/lib/admin/auth";
import { handleError, revalidateSite } from "@/lib/admin/action";
import { dbMessage, fail, ok, zodFail, type ActionResult } from "@/lib/admin/result";
import { postSchema, type PostInput } from "@/lib/admin/schemas";

/** Allow only what the editor produces. */
function clean(html: string) {
  return sanitizeHtml(html, {
    allowedTags: ["h2", "h3", "p", "br", "strong", "b", "em", "i", "u", "s", "ul", "ol", "li", "blockquote", "a", "hr"],
    allowedAttributes: { a: ["href", "target", "rel"] },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: /^https?:\/\//i.test(attribs.href ?? "") ? { ...attribs, target: "_blank", rel: "noopener noreferrer" } : attribs,
      }),
    },
  });
}

export async function savePost(id: string | null, input: PostInput): Promise<ActionResult<{ id: string }>> {
  try {
    const { supabase } = await actionContext();
    const parsed = postSchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);
    const data = {
      ...parsed.data,
      content: { es: clean(parsed.data.content.es), en: clean(parsed.data.content.en) },
      published_at: new Date(parsed.data.published_at).toISOString(),
    };
    if (id) {
      const { error } = await supabase.from("posts").update(data).eq("id", id);
      if (error) return fail(dbMessage(error));
      revalidateSite();
      return ok({ id }, "Artículo guardado");
    }
    const { data: row, error } = await supabase.from("posts").insert(data).select("id").single();
    if (error) return fail(dbMessage(error));
    revalidateSite();
    return ok({ id: (row as { id: string }).id }, "Artículo creado");
  } catch (e) {
    return handleError(e);
  }
}

export async function togglePostPublished(id: string, value: boolean): Promise<ActionResult> {
  try {
    const { supabase } = await actionContext();
    const { error } = await supabase.from("posts").update({ published: value }).eq("id", id);
    if (error) return fail(dbMessage(error));
    revalidateSite();
    return ok(undefined, value ? "Artículo publicado" : "Artículo oculto");
  } catch (e) {
    return handleError(e);
  }
}

export async function deletePost(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await actionContext();
    const { data: media } = await supabase.from("media").select("path").eq("owner_type", "post").eq("owner_id", id);
    const paths = ((media ?? []) as { path: string | null }[]).map((m) => m.path).filter((p): p is string => !!p);
    if (paths.length) await supabase.storage.from("media").remove(paths);
    await supabase.from("media").delete().eq("owner_type", "post").eq("owner_id", id);
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) return fail(dbMessage(error));
    revalidateSite();
  } catch (e) {
    return handleError(e);
  }
  redirect("/admin/blog");
}
