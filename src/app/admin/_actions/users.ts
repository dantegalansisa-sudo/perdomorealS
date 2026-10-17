"use server";
import { headers } from "next/headers";
import { z } from "zod";
import { actionContext } from "@/lib/admin/auth";
import { handleError } from "@/lib/admin/action";
import { hasServiceRole, SITE_URL } from "@/lib/env";
import { createServiceClient } from "@/lib/supabase/service";
import { dbMessage, fail, ok, zodFail, type ActionResult } from "@/lib/admin/result";
import { inviteSchema } from "@/lib/admin/schemas";

export async function updateUserRole(userId: string, role: "admin" | "editor"): Promise<ActionResult> {
  try {
    const { supabase, userId: me } = await actionContext("admin");
    const parsed = z.object({ userId: z.string().uuid(), role: z.enum(["admin", "editor"]) }).safeParse({ userId, role });
    if (!parsed.success) return zodFail(parsed.error);
    if (parsed.data.userId === me && parsed.data.role !== "admin") return fail("No puedes quitarte tu propio rol de administrador.");
    const { error, count } = await supabase.from("profiles").update({ role: parsed.data.role }, { count: "exact" }).eq("id", parsed.data.userId);
    if (error) return fail(dbMessage(error));
    if (!count) return fail("No se encontró el usuario.");
    return ok(undefined, `Rol actualizado a ${parsed.data.role === "admin" ? "Administrador" : "Editor"}`);
  } catch (e) {
    return handleError(e);
  }
}

async function origin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : SITE_URL;
}

export async function inviteUser(email: string, role: "admin" | "editor"): Promise<ActionResult> {
  try {
    await actionContext("admin");
    if (!hasServiceRole) return fail("Configura SUPABASE_SERVICE_ROLE_KEY en el servidor para invitar usuarios.");
    const parsed = inviteSchema.safeParse({ email: email.trim().toLowerCase(), role });
    if (!parsed.success) return zodFail(parsed.error);
    const admin = createServiceClient();
    const { data, error } = await admin.auth.admin.inviteUserByEmail(parsed.data.email, {
      redirectTo: `${await origin()}/admin/login/reset`,
    });
    if (error) {
      if (/already/i.test(error.message)) return fail("Ese correo ya tiene una cuenta.");
      return fail(`No se pudo enviar la invitación: ${error.message}`);
    }
    if (data.user) {
      // The DB trigger creates an 'editor' profile; ensure it exists with the chosen role.
      await admin.from("profiles").upsert({ id: data.user.id, email: parsed.data.email, role: parsed.data.role }, { onConflict: "id" });
    }
    return ok(undefined, `Invitación enviada a ${parsed.data.email}`);
  } catch (e) {
    return handleError(e);
  }
}

export async function removeUser(userId: string): Promise<ActionResult> {
  try {
    const { userId: me } = await actionContext("admin");
    if (!hasServiceRole) return fail("Configura SUPABASE_SERVICE_ROLE_KEY para eliminar usuarios.");
    if (!z.string().uuid().safeParse(userId).success) return fail("Usuario inválido");
    if (userId === me) return fail("No puedes eliminar tu propia cuenta.");
    const { error } = await createServiceClient().auth.admin.deleteUser(userId);
    if (error) return fail(`No se pudo eliminar: ${error.message}`);
    return ok(undefined, "Usuario eliminado");
  } catch (e) {
    return handleError(e);
  }
}
