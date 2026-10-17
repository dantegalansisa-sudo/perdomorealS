"use client";
import { useEffect } from "react";

/** Lenis smooth scroll, loaded after hydration. Skipped for reduced motion and touch devices. */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    let raf = 0;
    let destroy = () => {};
    let cancelled = false;
    import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      const lenis = new Lenis({ duration: 1.1, easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
      const loop = (time: number) => {
        lenis.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      (window as unknown as { __lenis?: unknown }).__lenis = lenis;
      destroy = () => lenis.destroy();
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      destroy();
    };
  }, []);
  return null;
}
