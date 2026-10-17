"use server";
import { redirect } from "next/navigation";
import { actionContext } from "@/lib/admin/auth";
import { handleError, revalidateSite } from "@/lib/admin/action";
import { dbMessage, fail, ok, zodFail, type ActionResult } from "@/lib/admin/result";
import { propertySchema, type PropertyInput } from "@/lib/admin/schemas";

export async function saveProperty(id: string | null, input: PropertyInput): Promise<ActionResult<{ id: string }>> {
  try {
    const { supabase } = await actionContext();
    const parsed = propertySchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);
    const data = { ...parsed.data, updated_at: new Date().toISOString() };
    if (id) {
      const { error } = await supabase.from("properties").update(data).eq("id", id);
      if (error) return fail(dbMessage(error));
      revalidateSite();
      return ok({ id }, "Propiedad guardada");
    }
    const { data: row, error } = await supabase.from("properties").insert(data).select("id").single();
    if (error) return fail(dbMessage(error));
    revalidateSite();
    return ok({ id: (row as { id: string }).id }, "Propiedad creada");
  } catch (e) {
    return handleError(e);
  }
}

export async function togglePropertyFlag(id: string, field: "published" | "featured", value: boolean): Promise<ActionResult> {
  try {
    const { supabase } = await actionContext();
    const { error } = await supabase.from("properties").update({ [field]: value, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) return fail(dbMessage(error));
    revalidateSite();
    const msg = field === "published" ? (value ? "Propiedad publicada" : "Propiedad oculta") : value ? "Destacada en la home" : "Quitada de destacadas";
    return ok(undefined, msg);
  } catch (e) {
    return handleError(e);
  }
}

export async function deleteProperty(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await actionContext();
    const { data: media } = await supabase.from("media").select("path").eq("owner_type", "property").eq("owner_id", id);
    const paths = ((media ?? []) as { path: string | null }[]).map((m) => m.path).filter((p): p is string => !!p);
    if (paths.length) await supabase.storage.from("media").remove(paths);
    await supabase.from("media").delete().eq("owner_type", "property").eq("owner_id", id);
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) return fail(dbMessage(error));
    revalidateSite();
  } catch (e) {
    return handleError(e);
  }
  redirect("/admin/propiedades");
}
