import type { Metadata } from "next";
import { LoginShell, ResetPasswordForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Nueva contraseña" };

export default function ResetPasswordPage() {
  return (
    <LoginShell>
      <ResetPasswordForm />
    </LoginShell>
  );
}
