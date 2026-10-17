"use server";
import { actionContext } from "@/lib/admin/auth";
import { handleError, revalidateSite } from "@/lib/admin/action";
import { dbMessage, fail, ok, zodFail, type ActionResult } from "@/lib/admin/result";
import { settingsSchema, type SettingsInput } from "@/lib/admin/schemas";

export async function saveSettings(input: SettingsInput): Promise<ActionResult> {
  try {
    const { supabase } = await actionContext("admin");
    const parsed = settingsSchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);
    // Drop empty per-project messages to keep the json tidy.
    const projectMessages = Object.fromEntries(Object.entries(parsed.data.whatsapp_project_messages).filter(([, v]) => v.es || v.en));
    const socials = Object.fromEntries(Object.entries(parsed.data.socials).filter(([, v]) => v));
    const { error } = await supabase
      .from("settings")
      .upsert({ id: 1, ...parsed.data, whatsapp_project_messages: projectMessages, socials, updated_at: new Date().toISOString() }, { onConflict: "id" });
    if (error) return fail(dbMessage(error));
    revalidateSite();
    return ok(undefined, "Ajustes guardados");
  } catch (e) {
    return handleError(e);
  }
}
