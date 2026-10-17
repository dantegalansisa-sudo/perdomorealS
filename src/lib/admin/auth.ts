import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";
import { hasSupabase } from "@/lib/env";
import type { Profile } from "@/lib/types";

export type SessionClient = Awaited<ReturnType<typeof createSessionClient>>;

export type AdminContext = {
  supabase: SessionClient;
  userId: string;
  email: string;
  profile: Profile | null;
};

export type StaffContext = AdminContext & { profile: Profile };

/** Current user + profile (memoized per request). Returns null when not logged in. */
export const getAdminContext = cache(async (): Promise<AdminContext | null> => {
  // Without Supabase the admin layout renders a setup notice; guards then fall through to /admin/login.
  if (!hasSupabase) return null;
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("id,email,role,full_name")
    .eq("id", user.id)
    .maybeSingle();
  const profile = (data as Profile | null) ?? null;
  const valid = profile && (profile.role === "admin" || profile.role === "editor") ? profile : null;
  return { supabase, userId: user.id, email: user.email ?? "", profile: valid };
});

/** Page guard: logged-in user with role admin or editor. */
export async function requireStaff(): Promise<StaffContext> {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login");
  if (!ctx.profile) redirect("/admin/sin-acceso");
  return ctx as StaffContext;
}

/** Page guard: admin only. Editors are sent to the no-access page. */
export async function requireAdmin(): Promise<StaffContext> {
  const ctx = await requireStaff();
  if (ctx.profile.role !== "admin") redirect("/admin/sin-acceso?motivo=admin");
  return ctx;
}

export class AuthError extends Error {}

/** Server-action guard. Throws AuthError (caught by `runAction`). */
export async function actionContext(role: "staff" | "admin" = "staff"): Promise<StaffContext> {
  const ctx = await getAdminContext();
  if (!ctx) throw new AuthError("Tu sesión expiró. Vuelve a iniciar sesión.");
  if (!ctx.profile) throw new AuthError("Tu usuario no tiene acceso al panel.");
  if (role === "admin" && ctx.profile.role !== "admin")
    throw new AuthError("Solo los administradores pueden realizar esta acción.");
  return ctx as StaffContext;
}
