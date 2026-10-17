import type { Metadata, Viewport } from "next";
import { anton, manrope } from "@/app/fonts";
import { hasSupabase } from "@/lib/env";
import { SetupNotice } from "@/components/admin/SetupNotice";
import { ToastProvider } from "@/components/admin/Toast";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Admin · Perdomo Real Estate", template: "%s · Admin Perdomo" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#FFFFFF", width: "device-width", initialScale: 1 };

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${anton.variable} ${manrope.variable}`}>
      <body className="min-h-dvh bg-sand text-navy antialiased">
        {hasSupabase ? <ToastProvider>{children}</ToastProvider> : <SetupNotice />}
      </body>
    </html>
  );
}
