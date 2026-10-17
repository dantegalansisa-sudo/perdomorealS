"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Shield, Trash2, UserPlus } from "lucide-react";
import { inviteUser, removeUser, updateUserRole } from "@/app/admin/_actions/users";
import type { Profile } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useToast } from "./Toast";

type Row = Profile & { created_at?: string };

export function UsersManager({ users, me, canInvite }: { users: Row[]; me: string; canInvite: boolean }) {
  const toast = useToast();
  const router = useRouter();
  const [rows, setRows] = useState(users);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "editor">("editor");
  const [pending, start] = useTransition();

  function changeRole(id: string, next: "admin" | "editor") {
    const prev = rows;
    setRows((r) => r.map((u) => (u.id === id ? { ...u, role: next } : u)));
    start(async () => {
      const res = await updateUserRole(id, next);
      if (!toast.result(res)) setRows(prev);
    });
  }

  function invite(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await inviteUser(email, role);
      if (toast.result(res)) {
        setEmail("");
        router.refresh();
      }
    });
  }

  function remove(u: Row) {
    if (!confirm(`¿Eliminar la cuenta de ${u.email}? Perderá el acceso de inmediato.`)) return;
    start(async () => {
      const res = await removeUser(u.id);
      if (toast.result(res)) setRows((r) => r.filter((x) => x.id !== u.id));
    });
  }

  return (
    <div className="space-y-5">
      <div className="card p-5 sm:p-6">
        <h2 className="mb-1 flex items-center gap-2 font-sans text-base font-extrabold normal-case tracking-normal">
          <UserPlus className="size-4 text-gold-dark" /> Invitar usuario
        </h2>
        {canInvite ? (
          <>
            <p className="mb-4 text-xs text-stone">Recibirá un correo para crear su contraseña y entrar al panel.</p>
            <form onSubmit={invite} className="flex flex-col gap-3 sm:flex-row">
              <input type="email" required placeholder="correo@ejemplo.com" className="field flex-1" value={email} onChange={(e) => setEmail(e.target.value)} />
              <select className="field sm:!w-40" value={role} onChange={(e) => setRole(e.target.value as "admin" | "editor")}>
                <option value="editor">Editor</option>
                <option value="admin">Administrador</option>
              </select>
              <button className="btn btn-gold btn-sm disabled:opacity-60" disabled={pending}>
                {pending && <Loader2 className="size-4 animate-spin" />} Enviar invitación
              </button>
            </form>
          </>
        ) : (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Para invitar usuarios desde aquí define <code className="font-bold">SUPABASE_SERVICE_ROLE_KEY</code> en las variables de entorno del servidor. Mientras
            tanto puedes crearlos en Supabase → Authentication → Users (entran como Editor).
          </p>
        )}
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="border-b border-line bg-sand/60">
              <tr className="text-left text-[11px] font-extrabold uppercase tracking-wider text-stone">
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Alta</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2 font-bold text-navy">
                      <span className="grid size-8 place-items-center rounded-full bg-sand-2 text-xs font-extrabold uppercase text-navy-soft">{u.email.slice(0, 2)}</span>
                      <span className="min-w-0">
                        <span className="block truncate">{u.full_name || u.email}</span>
                        {u.full_name && <span className="block text-xs font-normal text-stone">{u.email}</span>}
                      </span>
                      {u.id === me && <span className="rounded-full bg-gold-soft px-2 py-0.5 text-[10px] font-extrabold">Tú</span>}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {u.role === "admin" && <Shield className="size-4 text-gold-dark" />}
                      <select
                        className={cn("rounded-full border border-line px-3 py-1 text-xs font-extrabold", u.role === "admin" ? "bg-navy text-white" : "bg-white")}
                        value={u.role}
                        disabled={pending || u.id === me}
                        onChange={(e) => changeRole(u.id, e.target.value as "admin" | "editor")}
                      >
                        <option value="editor">Editor</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-stone">{u.created_at ? new Date(u.created_at).toLocaleDateString("es-DO") : "—"}</td>
                  <td className="px-4 py-3 text-right">
                    {canInvite && u.id !== me && (
                      <button onClick={() => remove(u)} disabled={pending} className="text-stone hover:text-red-600" title="Eliminar usuario">
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="grid gap-3 text-xs text-stone sm:grid-cols-2">
        <p className="card p-4">
          <b className="text-navy">Administrador:</b> acceso completo, incluidos ajustes del sitio, usuarios y eliminación de leads.
        </p>
        <p className="card p-4">
          <b className="text-navy">Editor:</b> gestiona proyectos, unidades, propiedades, blog, FAQ y leads. Sin acceso a ajustes ni usuarios.
        </p>
      </div>
    </div>
  );
}
