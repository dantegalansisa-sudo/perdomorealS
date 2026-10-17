"use server";
import { z } from "zod";
import { actionContext } from "@/lib/admin/auth";
import { handleError, revalidateSite } from "@/lib/admin/action";
import { dbMessage, fail, ok, zodFail, type ActionResult } from "@/lib/admin/result";
import { faqSchema, type FaqInput } from "@/lib/admin/schemas";
import type { Faq } from "@/lib/types";

export async function saveFaq(id: string | null, input: FaqInput): Promise<ActionResult<Faq>> {
  try {
    const { supabase } = await actionContext();
    const parsed = faqSchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);
    if (id) {
      const { data, error } = await supabase.from("faqs").update(parsed.data).eq("id", id).select("*").single();
      if (error) return fail(dbMessage(error));
      revalidateSite();
      return ok(data as Faq, "Pregunta guardada");
    }
    // Append at the end of its scope.
    let q = supabase.from("faqs").select("sort").order("sort", { ascending: false }).limit(1);
    q = parsed.data.project_id ? q.eq("project_id", parsed.data.project_id) : q.is("project_id", null);
    const { data: last } = await q.maybeSingle();
    const sort = ((last as { sort: number } | null)?.sort ?? -1) + 1;
    const { data, error } = await supabase.from("faqs").insert({ ...parsed.data, sort }).select("*").single();
    if (error) return fail(dbMessage(error));
    revalidateSite();
    return ok(data as Faq, "Pregunta creada");
  } catch (e) {
    return handleError(e);
  }
}

export async function reorderFaqs(ids: string[]): Promise<ActionResult> {
  try {
    const { supabase } = await actionContext();
    const parsed = z.array(z.string().uuid()).max(500).safeParse(ids);
    if (!parsed.success) return fail("Orden inválido");
    const results = await Promise.all(parsed.data.map((id, i) => supabase.from("faqs").update({ sort: i }).eq("id", id)));
    const err = results.find((r) => r.error)?.error;
    if (err) return fail(dbMessage(err));
    revalidateSite();
    return ok(undefined, "Orden actualizado");
  } catch (e) {
    return handleError(e);
  }
}

export async function toggleFaqPublished(id: string, value: boolean): Promise<ActionResult> {
  try {
    const { supabase } = await actionContext();
    const { error } = await supabase.from("faqs").update({ published: value }).eq("id", id);
    if (error) return fail(dbMessage(error));
    revalidateSite();
    return ok(undefined, value ? "Pregunta publicada" : "Pregunta oculta");
  } catch (e) {
    return handleError(e);
  }
}

export async function deleteFaq(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await actionContext();
    const { error } = await supabase.from("faqs").delete().eq("id", id);
    if (error) return fail(dbMessage(error));
    revalidateSite();
    return ok(undefined, "Pregunta eliminada");
  } catch (e) {
    return handleError(e);
  }
}
