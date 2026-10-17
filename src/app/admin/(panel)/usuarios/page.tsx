import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { hasServiceRole } from "@/lib/env";
import { PageHeader } from "@/components/admin/ui";
import { UsersManager } from "@/components/admin/UsersManager";
import type { Profile } from "@/lib/types";

export const metadata: Metadata = { title: "Usuarios" };

export default async function UsersPage() {
  const { supabase, userId } = await requireAdmin();
  const { data } = await supabase.from("profiles").select("id,email,role,full_name,created_at").order("created_at");
  return (
    <>
      <PageHeader title="Usuarios" description="Personas con acceso al panel y sus roles." />
      <UsersManager users={(data ?? []) as (Profile & { created_at?: string })[]} me={userId} canInvite={hasServiceRole} />
    </>
  );
}
