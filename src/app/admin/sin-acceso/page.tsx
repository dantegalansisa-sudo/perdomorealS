import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Lock } from "lucide-react";
import { getAdminContext } from "@/lib/admin/auth";
import { logoutAction } from "@/app/admin/_actions/auth";

export const metadata: Metadata = { title: "Sin acceso" };

export default async function NoAccessPage({ searchParams }: { searchParams: Promise<{ motivo?: string }> }) {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login");
  const { motivo } = await searchParams;
  const adminOnly = motivo === "admin" && !!ctx.profile;
  return (
    <div className="grid min-h-dvh place-items-center px-4">
      <div className="card w-full max-w-md p-8 text-center">
        <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-gold-soft text-gold-dark">
          <Lock className="size-5" />
        </div>
        <h1 className="text-3xl text-navy">{adminOnly ? "Solo administradores" : "Sin acceso"}</h1>
        <p className="mt-3 text-sm text-navy-soft">
          {adminOnly
            ? "Esta sección está reservada a usuarios con rol de administrador."
            : `La cuenta ${ctx.email} no tiene permisos para usar el panel. Pide a un administrador que te asigne un rol.`}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {adminOnly ? (
            <Link href="/admin" className="btn btn-navy btn-sm">
              Volver al dashboard
            </Link>
          ) : (
            <form action={logoutAction}>
              <button className="btn btn-navy btn-sm">Cerrar sesión</button>
            </form>
          )}
          <a href="/es" className="btn btn-ghost btn-sm">
            Ver sitio
          </a>
        </div>
      </div>
    </div>
  );
}
