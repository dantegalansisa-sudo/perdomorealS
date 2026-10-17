import { RevealText } from "@/components/motion/RevealText";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

/**
 * Eyebrow + display title (mask reveal) + optional lead. Use `as="h1"` only once per page.
 * `immediate` (page headers, above the fold) uses CSS-only entrances so nothing waits for hydration.
 */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  as = "h2",
  align = "left",
  className,
  titleClassName,
  immediate,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  as?: "h1" | "h2";
  align?: "left" | "center";
  className?: string;
  titleClassName?: string;
  immediate?: boolean;
}) {
  const eyebrowEl = eyebrow && (
    <p className="eyebrow mb-4 inline-flex items-center gap-3">
      <span className="h-px w-8 bg-gold" aria-hidden />
      {eyebrow}
    </p>
  );
  const leadEl = lead && <p className={cn("mt-5 text-base leading-relaxed text-stone sm:text-lg", align === "center" && "mx-auto")}>{lead}</p>;
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrowEl && (immediate ? <div className="hero-fade">{eyebrowEl}</div> : <Reveal y={12}>{eyebrowEl}</Reveal>)}
      <RevealText as={as} immediate={immediate} delay={immediate ? 0.05 : 0} className={cn("text-[2.6rem] text-navy sm:text-6xl lg:text-7xl", titleClassName)}>
        {title}
      </RevealText>
      {leadEl &&
        (immediate ? (
          <div className="hero-fade" style={{ animationDelay: "0.2s" }}>
            {leadEl}
          </div>
        ) : (
          <Reveal delay={0.15}>{leadEl}</Reveal>
        ))}
    </div>
  );
}
