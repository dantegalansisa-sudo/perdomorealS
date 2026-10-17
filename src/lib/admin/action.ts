import "server-only";
import { revalidatePath } from "next/cache";
import { AuthError } from "./auth";
import { fail } from "./result";

/** Refresh every public page (ISR) after a mutation. */
export function revalidateSite() {
  revalidatePath("/", "layout");
}

/** Converts thrown errors into a friendly ActionResult. */
export function handleError(e: unknown) {
  if (e instanceof AuthError) return fail(e.message);
  console.error("[admin action]", e);
  return fail("Ocurrió un error inesperado. Intenta de nuevo.");
}
