"use client";
import { motion, useReducedMotion } from "motion/react";
import { EASE } from "./easings";

type Tag = "h1" | "h2" | "h3" | "p" | "span";

/**
 * Word-by-word mask reveal for display headings. The text stays in the DOM as real text
 * (SEO + a11y); each word rises from a clipped line.
 */
export function RevealText({
  children,
  as: Tag = "h2",
  className,
  delay = 0,
  immediate = false,
}: {
  children: string;
  as?: Tag;
  className?: string;
  delay?: number;
  /** Animate on mount instead of on scroll (hero). */
  immediate?: boolean;
}) {
  const reduce = useReducedMotion();
  const lines = children.split("\n");
  let wordIndex = 0;
  const trigger = immediate ? { animate: { y: "0%", rotate: 0 } } : { whileInView: { y: "0%", rotate: 0 }, viewport: { once: true, amount: 0.6 } };
  return (
    <Tag className={className}>
      {lines.map((line, li) => (
        <span key={li} className="block">
          {line.split(" ").map((word) => {
            const i = wordIndex++;
            return (
              <span key={i} className="inline-block overflow-hidden pb-[0.06em] align-bottom">
                <motion.span
                  className="inline-block will-change-transform"
                  initial={reduce ? false : { y: "110%", rotate: 2 }}
                  {...trigger}
                  transition={{ duration: 0.85, delay: delay + i * 0.06, ease: EASE.premium }}
                >
                  {word}
                </motion.span>
                {" "}
              </span>
            );
          })}
        </span>
      ))}
    </Tag>
  );
}
