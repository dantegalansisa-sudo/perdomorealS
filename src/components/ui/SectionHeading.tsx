import { RevealText } from "@/components/motion/RevealText";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

/** Eyebrow + display title (mask reveal) + optional lead. Use `as="h1"` only once per page. */
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
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <Reveal y={12}>
          <p className="eyebrow mb-4 inline-flex items-center gap-3">
            <span className="h-px w-8 bg-gold" aria-hidden />
            {eyebrow}
          </p>
        </Reveal>
      )}
      <RevealText as={as} immediate={immediate} className={cn("text-[2.6rem] text-navy sm:text-6xl lg:text-7xl", titleClassName)}>
        {title}
      </RevealText>
      {lead && (
        <Reveal delay={0.15}>
          <p className={cn("mt-5 text-base leading-relaxed text-stone sm:text-lg", align === "center" && "mx-auto")}>{lead}</p>
        </Reveal>
      )}
    </div>
  );
}
