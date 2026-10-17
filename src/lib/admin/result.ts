import type { ZodError } from "zod";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export function ok<T>(data?: T, message?: string): ActionResult<T> {
  return { ok: true, data, message };
}

export function fail(error: string, fieldErrors?: Record<string, string>): { ok: false; error: string; fieldErrors?: Record<string, string> } {
  return { ok: false, error, fieldErrors };
}

/** Converts a zod error into a friendly Spanish message + per-field map. */
export function zodFail(err: ZodError): { ok: false; error: string; fieldErrors: Record<string, string> } {
  const fieldErrors: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.map(String).join(".") || "_";
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  const first = err.issues[0];
  const where = first?.path.length ? ` (${first.path.map(String).join(".")})` : "";
  return { ok: false, error: `Revisa los datos: ${first?.message ?? "inválido"}${where}`, fieldErrors };
}

/** Maps a Postgres / Supabase error into Spanish. */
export function dbMessage(error: { code?: string; message?: string } | null | undefined): string {
  if (!error) return "Error desconocido.";
  if (error.code === "23505") {
    if (error.message?.includes("slug")) return "Ese slug ya está en uso. Elige otro.";
    if (error.message?.includes("lot_number")) return "Ya existe una unidad con ese número de lote.";
    return "Ya existe un registro con esos datos (valor duplicado).";
  }
  if (error.code === "42501" || error.message?.includes("row-level security"))
    return "No tienes permisos para esta acción.";
  if (error.code === "23503") return "El registro está relacionado con otros datos.";
  if (error.code === "23514") return "Algún valor no es válido para la base de datos.";
  return `Error de base de datos: ${error.message ?? "desconocido"}`;
}
