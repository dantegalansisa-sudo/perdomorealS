import type { Metadata } from "next";
import { LoginForm, LoginShell } from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  const sp = await searchParams;
  const next = Array.isArray(sp.next) ? sp.next[0] : sp.next;
  return (
    <LoginShell>
      <LoginForm next={next} />
    </LoginShell>
  );
}
