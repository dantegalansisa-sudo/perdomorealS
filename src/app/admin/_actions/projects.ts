"use server";
import { redirect } from "next/navigation";
import { actionContext } from "@/lib/admin/auth";
import { handleError, revalidateSite } from "@/lib/admin/action";
import { dbMessage, fail, ok, zodFail, type ActionResult } from "@/lib/admin/result";
import { projectSchema, villaModelSchema, type ProjectInput, type VillaModelInput } from "@/lib/admin/schemas";
import type { VillaModel } from "@/lib/types";

export async function saveProject(id: string | null, input: ProjectInput): Promise<ActionResult<{ id: string }>> {
  try {
    const { supabase } = await actionContext();
    const parsed = projectSchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);
    const data = { ...parsed.data, updated_at: new Date().toISOString() };

    // Only one flagship project at a time.
    if (data.is_flagship) {
      let q = supabase.from("projects").update({ is_flagship: false }).eq("is_flagship", true);
      if (id) q = q.neq("id", id);
      await q;
    }

    if (id) {
      const { error } = await supabase.from("projects").update(data).eq("id", id);
      if (error) return fail(dbMessage(error));
      revalidateSite();
      return ok({ id }, "Proyecto guardado");
    }
    const { data: row, error } = await supabase.from("projects").insert(data).select("id").single();
    if (error) return fail(dbMessage(error));
    revalidateSite();
    return ok({ id: (row as { id: string }).id }, "Proyecto creado");
  } catch (e) {
    return handleError(e);
  }
}

export async function deleteProject(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await actionContext();
    // Clean up media rows + storage objects of the project and its models.
    const { data: models } = await supabase.from("villa_models").select("id").eq("project_id", id);
    const ownerIds = [id, ...((models ?? []) as { id: string }[]).map((m) => m.id)];
    const { data: media } = await supabase.from("media").select("id,path").in("owner_id", ownerIds);
    const paths = ((media ?? []) as { path: string | null }[]).map((m) => m.path).filter((p): p is string => !!p);
    if (paths.length) await supabase.storage.from("media").remove(paths);
    await supabase.from("media").delete().in("owner_id", ownerIds);

    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) return fail(dbMessage(error));
    revalidateSite();
  } catch (e) {
    return handleError(e);
  }
  redirect("/admin/proyectos");
}

export async function toggleProjectFlag(id: string, field: "published" | "featured", value: boolean): Promise<ActionResult> {
  try {
    const { supabase } = await actionContext();
    const { error } = await supabase.from("projects").update({ [field]: value }).eq("id", id);
    if (error) return fail(dbMessage(error));
    revalidateSite();
    return ok(undefined, value ? (field === "published" ? "Proyecto publicado" : "Destacado") : field === "published" ? "Proyecto oculto" : "Ya no está destacado");
  } catch (e) {
    return handleError(e);
  }
}

// ───────── Villa models ─────────

export async function saveVillaModel(id: string | null, input: VillaModelInput): Promise<ActionResult<VillaModel>> {
  try {
    const { supabase } = await actionContext();
    const parsed = villaModelSchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);
    const q = id
      ? supabase.from("villa_models").update(parsed.data).eq("id", id).select("*").single()
      : supabase.from("villa_models").insert(parsed.data).select("*").single();
    const { data, error } = await q;
    if (error) return fail(dbMessage(error));
    revalidateSite();
    return ok(data as VillaModel, id ? "Modelo guardado" : "Modelo creado");
  } catch (e) {
    return handleError(e);
  }
}

export async function deleteVillaModel(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await actionContext();
    const { data: media } = await supabase.from("media").select("path").eq("owner_type", "model").eq("owner_id", id);
    const paths = ((media ?? []) as { path: string | null }[]).map((m) => m.path).filter((p): p is string => !!p);
    if (paths.length) await supabase.storage.from("media").remove(paths);
    await supabase.from("media").delete().eq("owner_type", "model").eq("owner_id", id);
    const { error } = await supabase.from("villa_models").delete().eq("id", id);
    if (error) return fail(dbMessage(error));
    revalidateSite();
    return ok(undefined, "Modelo eliminado");
  } catch (e) {
    return handleError(e);
  }
}
