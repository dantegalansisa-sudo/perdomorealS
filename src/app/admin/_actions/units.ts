"use server";
import { z } from "zod";
import { actionContext } from "@/lib/admin/auth";
import { handleError, revalidateSite } from "@/lib/admin/action";
import { dbMessage, fail, ok, zodFail, type ActionResult } from "@/lib/admin/result";
import { unitPatchSchema, unitStatus } from "@/lib/admin/schemas";
import type { Unit, UnitStatus } from "@/lib/types";

const uuid = z.string().uuid();

export async function updateUnit(id: string, patch: z.input<typeof unitPatchSchema>): Promise<ActionResult<Unit>> {
  try {
    const { supabase } = await actionContext();
    if (!uuid.safeParse(id).success) return fail("Unidad inválida");
    const parsed = unitPatchSchema.safeParse(patch);
    if (!parsed.success) return zodFail(parsed.error);
    const { data, error } = await supabase
      .from("units")
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single();
    if (error) return fail(dbMessage(error));
    revalidateSite();
    return ok(data as Unit, "Unidad actualizada");
  } catch (e) {
    return handleError(e);
  }
}

export async function bulkUnitStatus(ids: string[], status: UnitStatus): Promise<ActionResult> {
  try {
    const { supabase } = await actionContext();
    const parsed = z.object({ ids: z.array(uuid).min(1, "Selecciona al menos una unidad").max(1000), status: unitStatus }).safeParse({ ids, status });
    if (!parsed.success) return zodFail(parsed.error);
    const { error } = await supabase
      .from("units")
      .update({ status: parsed.data.status, updated_at: new Date().toISOString() })
      .in("id", parsed.data.ids);
    if (error) return fail(dbMessage(error));
    revalidateSite();
    return ok(undefined, `${ids.length} unidad${ids.length === 1 ? "" : "es"} actualizada${ids.length === 1 ? "" : "s"}`);
  } catch (e) {
    return handleError(e);
  }
}

const generateSchema = z.object({
  projectId: uuid,
  count: z.number().int().min(1, "Mínimo 1 unidad").max(1000, "Máximo 1000 unidades"),
  prefix: z.string().trim().max(10).default(""),
  start: z.number().int().min(0).default(1),
  modelId: uuid.nullable().default(null),
  price: z.number().min(0).nullable().default(null),
});

export async function generateUnits(input: z.input<typeof generateSchema>): Promise<ActionResult<number>> {
  try {
    const { supabase } = await actionContext();
    const parsed = generateSchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);
    const { projectId, count, prefix, start, modelId, price } = parsed.data;

    let lot_m2: number | null = null;
    let built_m2: number | null = null;
    let modelPrice: number | null = null;
    if (modelId) {
      const { data: m } = await supabase.from("villa_models").select("lot_m2,built_m2,price_from").eq("id", modelId).maybeSingle();
      if (m) {
        lot_m2 = Number(m.lot_m2) || null;
        built_m2 = Number(m.built_m2) || null;
        modelPrice = m.price_from === null ? null : Number(m.price_from);
      }
    }
    const width = String(start + count - 1).length;
    const rows = Array.from({ length: count }, (_, i) => {
      const lot = start + i;
      return {
        project_id: projectId,
        model_id: modelId,
        code: `${prefix}${String(lot).padStart(Math.max(2, width), "0")}`,
        lot_number: lot,
        status: "available" as const,
        price: price ?? modelPrice,
        lot_m2,
        built_m2,
      };
    });
    const { error } = await supabase.from("units").insert(rows);
    if (error) return fail(dbMessage(error));
    revalidateSite();
    return ok(count, `${count} unidades creadas`);
  } catch (e) {
    return handleError(e);
  }
}

export async function addUnit(projectId: string): Promise<ActionResult<Unit>> {
  try {
    const { supabase } = await actionContext();
    if (!uuid.safeParse(projectId).success) return fail("Proyecto inválido");
    const { data: last } = await supabase.from("units").select("lot_number").eq("project_id", projectId).order("lot_number", { ascending: false }).limit(1).maybeSingle();
    const lot = ((last as { lot_number: number } | null)?.lot_number ?? 0) + 1;
    const { data, error } = await supabase
      .from("units")
      .insert({ project_id: projectId, code: `V-${String(lot).padStart(2, "0")}`, lot_number: lot, status: "available" })
      .select("*")
      .single();
    if (error) return fail(dbMessage(error));
    revalidateSite();
    return ok(data as Unit, "Unidad añadida");
  } catch (e) {
    return handleError(e);
  }
}

export async function deleteUnits(ids: string[]): Promise<ActionResult> {
  try {
    const { supabase } = await actionContext();
    const parsed = z.array(uuid).min(1).max(1000).safeParse(ids);
    if (!parsed.success) return fail("Selecciona al menos una unidad");
    const { error } = await supabase.from("units").delete().in("id", parsed.data);
    if (error) return fail(dbMessage(error));
    revalidateSite();
    return ok(undefined, `${ids.length} unidad${ids.length === 1 ? "" : "es"} eliminada${ids.length === 1 ? "" : "s"}`);
  } catch (e) {
    return handleError(e);
  }
}
