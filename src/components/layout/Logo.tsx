import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <path d="M20 3 37 15v22H3V15L20 3Z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M14 37V21h8.5a5 5 0 0 1 0 10H14" fill="none" stroke="#C9A961" strokeWidth="2.6" strokeLinejoin="round" />
    </svg>
  );
}

/** Text logo placeholder until the brand files arrive. */
export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", light ? "text-white" : "text-navy", className)}>
      <LogoMark className="size-9 shrink-0" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.35rem] tracking-[0.06em]">PERDOMO</span>
        <span className={cn("text-[0.56rem] font-bold tracking-[0.42em]", light ? "text-gold" : "text-[#7a5f24]")}>REAL ESTATE</span>
      </span>
    </span>
  );
}
