"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Building2,
  ExternalLink,
  Grid3x3,
  HelpCircle,
  Home,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  Settings,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/admin/_actions/auth";

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }>; admin?: boolean };

const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads", icon: Inbox },
  { href: "/admin/proyectos", label: "Proyectos", icon: Building2 },
  { href: "/admin/unidades", label: "Unidades", icon: Grid3x3 },
  { href: "/admin/propiedades", label: "Propiedades", icon: Home },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/faq", label: "FAQ", icon: HelpCircle },
  { href: "/admin/ajustes", label: "Ajustes", icon: Settings, admin: true },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users, admin: true },
];

const BOTTOM = ["/admin", "/admin/leads", "/admin/proyectos", "/admin/unidades"];

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({
  email,
  role,
  newLeads,
  children,
}: {
  email: string;
  role: "admin" | "editor";
  newLeads: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = NAV.filter((n) => !n.admin || role === "admin");

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const navList = (
    <nav className="flex flex-col gap-1">
      {items.map((n) => {
        const active = isActive(pathname, n.href);
        const Icon = n.icon;
        return (
          <Link
            key={n.href}
            href={n.href}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors",
              active ? "bg-navy text-white" : "text-navy-soft hover:bg-sand-2 hover:text-navy"
            )}
          >
            <Icon className={cn("size-4.5", active ? "text-gold" : "text-stone group-hover:text-gold-dark")} />
            <span className="flex-1">{n.label}</span>
            {n.href === "/admin/leads" && newLeads > 0 && (
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-extrabold", active ? "bg-gold text-navy" : "bg-gold-soft text-navy")}>
                {newLeads > 99 ? "99+" : newLeads}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  const userBox = (
    <div className="rounded-2xl border border-line bg-sand/70 p-3">
      <p className="truncate text-xs font-bold text-navy" title={email}>
        {email}
      </p>
      <p className="text-[11px] font-semibold text-stone">{role === "admin" ? "Administrador" : "Editor"}</p>
      <form action={logoutAction} className="mt-2">
        <button className="inline-flex items-center gap-1.5 text-xs font-bold text-stone hover:text-red-600">
          <LogOut className="size-3.5" /> Cerrar sesión
        </button>
      </form>
    </div>
  );

  return (
    <div className="min-h-dvh">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
        <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
          <button className="-ml-1 grid size-9 place-items-center rounded-xl text-navy hover:bg-sand-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Abrir menú">
            <Menu className="size-5" />
          </button>
          <Link href="/admin" className="flex items-baseline gap-2">
            <span className="font-display text-xl tracking-wide text-navy">PERDOMO</span>
            <span className="text-gold">·</span>
            <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-gold-dark">Admin</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <a href="/es" target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm !py-2">
              <ExternalLink className="size-3.5" /> <span className="hidden sm:inline">Ver sitio</span>
            </a>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-64 shrink-0 flex-col justify-between gap-6 overflow-y-auto border-r border-line bg-white px-4 py-6 lg:flex">
          {navList}
          {userBox}
        </aside>

        <main className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-12 lg:pt-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-navy/40 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 flex w-[82%] max-w-xs flex-col justify-between gap-6 overflow-y-auto bg-white px-4 py-5 shadow-2xl lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
            >
              <div>
                <div className="mb-5 flex items-center justify-between">
                  <span className="font-display text-xl text-navy">
                    PERDOMO <span className="text-gold">·</span> <span className="font-sans text-xs font-extrabold tracking-[0.2em] text-gold-dark">ADMIN</span>
                  </span>
                  <button className="grid size-9 place-items-center rounded-xl hover:bg-sand-2" onClick={() => setOpen(false)} aria-label="Cerrar menú">
                    <X className="size-5" />
                  </button>
                </div>
                {navList}
              </div>
              {userBox}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        <div className="grid grid-cols-5">
          {BOTTOM.map((href) => {
            const n = NAV.find((x) => x.href === href)!;
            const Icon = n.icon;
            const active = isActive(pathname, href);
            return (
              <Link key={href} href={href} className={cn("relative flex flex-col items-center gap-0.5 py-2 text-[10px] font-bold", active ? "text-navy" : "text-stone")}>
                <Icon className={cn("size-5", active && "text-gold-dark")} />
                {n.label}
                {href === "/admin/leads" && newLeads > 0 && <span className="absolute right-[calc(50%-18px)] top-1.5 size-2 rounded-full bg-gold" />}
              </Link>
            );
          })}
          <button onClick={() => setOpen(true)} className="flex flex-col items-center gap-0.5 py-2 text-[10px] font-bold text-stone">
            <Menu className="size-5" />
            Más
          </button>
        </div>
      </nav>
    </div>
  );
}
