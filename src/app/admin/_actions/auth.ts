"use server";
import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";
import { handleError, revalidateSite } from "@/lib/admin/action";
import { actionContext } from "@/lib/admin/auth";
import { ok, type ActionResult } from "@/lib/admin/result";

export async function logoutAction() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

/** Used by client components that mutate via the browser client (e.g. media). */
export async function revalidateSiteAction(): Promise<ActionResult> {
  try {
    await actionContext();
    revalidateSite();
    return ok();
  } catch (e) {
    return handleError(e);
  }
}
