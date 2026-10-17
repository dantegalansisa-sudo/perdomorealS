import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/** Server-safe presentational primitives for the admin panel. */

export function PageHeader({
  title,
  description,
  back,
  actions,
}: {
  title: string;
  description?: React.ReactNode;
  back?: { href: string; label: string };
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {back && (
          <Link href={back.href} className="mb-2 inline-flex items-center gap-1 text-xs font-bold text-stone hover:text-navy">
            <ChevronLeft className="size-3.5" /> {back.label}
          </Link>
        )}
        <h1 className="truncate text-3xl text-navy sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-stone">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("card p-5 sm:p-6", className)}>{children}</div>;
}

export function Section({
  title,
  description,
  actions,
  children,
  className,
  id,
}: {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("card scroll-mt-24 p-5 sm:p-6", className)}>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-sans text-base font-extrabold normal-case tracking-normal text-navy">{title}</h2>
          {description && <p className="mt-1 text-xs text-stone">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function EmptyState({ icon, title, children }: { icon?: React.ReactNode; title: string; children?: React.ReactNode }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      {icon && <div className="grid size-12 place-items-center rounded-full bg-sand-2 text-gold-dark">{icon}</div>}
      <p className="font-bold text-navy">{title}</p>
      {children && <div className="max-w-md text-sm text-stone">{children}</div>}
    </div>
  );
}

export function Pill({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-bold", className)}>
      {children}
    </span>
  );
}

export function PublishedPill({ published }: { published: boolean }) {
  return published ? (
    <Pill className="border-emerald-200 bg-emerald-50 text-emerald-700">Publicado</Pill>
  ) : (
    <Pill className="border-line bg-sand-2 text-stone">Borrador</Pill>
  );
}

export function PlaceholderPill() {
  return <Pill className="border-amber-200 bg-amber-50 text-amber-700">Ejemplo</Pill>;
}

/** Wrapper that makes wide tables scroll horizontally on small screens. */
export function TableWrap({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("card overflow-hidden p-0", className)}>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export const th = "whitespace-nowrap px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-wider text-stone";
export const td = "px-4 py-3 align-middle";
