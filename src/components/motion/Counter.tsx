"use client";
import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

export function Counter({ to, suffix = "", prefix = "", decimals = 0, locale = "es" }: { to: number; suffix?: string; prefix?: string; decimals?: number; locale?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const [val, setVal] = useState(reduce ? to : 0);
  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, to, { duration: 1.8, ease: [0.16, 1, 0.3, 1], onUpdate: setVal });
    return () => controls.stop();
  }, [inView, to, reduce]);
  const fmt = new Intl.NumberFormat(locale === "en" ? "en-US" : "es-DO", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {fmt.format(val)}
      {suffix}
    </span>
  );
}
