import { requireStaff } from "@/lib/admin/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireStaff();
  const { count } = await ctx.supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "new");
  return (
    <AdminShell email={ctx.email} role={ctx.profile.role} newLeads={count ?? 0}>
      {children}
    </AdminShell>
  );
}
