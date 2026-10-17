"use client";
import { useEffect, useRef } from "react";

/** Subtle gold ring that trails the native cursor on desktop. Native cursor is never hidden. */
export function CursorFollower() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let x = -100, y = -100, cx = -100, cy = -100, raf = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX - 17;
      y = e.clientY - 17;
      el.dataset.visible = "true";
      const target = e.target as HTMLElement | null;
      el.dataset.hover = target?.closest("a, button, [role=button], input[type=range], label") ? "true" : "false";
    };
    const leave = () => (el.dataset.visible = "false");
    const loop = () => {
      cx += (x - cx) * 0.18;
      cy += (y - cy) * 0.18;
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(raf);
    };
  }, []);
  return <div ref={ref} className="cursor-ring" aria-hidden />;
}
