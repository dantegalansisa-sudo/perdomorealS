"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useTranslations } from "next-intl";
import { ArrowDown, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { IsoVilla } from "@/components/ui/IsoVilla";
import { Magnetic } from "@/components/motion/Magnetic";
import { openLeadModal } from "@/lib/ui-store";
import { HeroSearchDesktop, HeroSearchMobile, QuickChips } from "./HeroSearch";

export function Hero({ title, subtitle, zones, villaSrc }: { title: string; subtitle: string; zones: string[]; villaSrc: string | null }) {
  const t = useTranslations("home.hero");
  const tc = useTranslations("common");
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // Mouse parallax (desktop only)
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });
  const wordX = useTransform(sx, (v) => v * -0.4);

  // Scroll parallax
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const villaY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 120]);
  const wordY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, -60]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, reduce ? 1 : 0.2]);

  useEffect(() => {
    if (reduce || !window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      mx.set((e.clientX / window.innerWidth - 0.5) * 30);
      my.set((e.clientY / window.innerHeight - 0.5) * 20);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my, reduce]);

  const villa = villaSrc ? (
    <Image src={villaSrc} alt="" width={1200} height={900} priority sizes="(min-width: 1024px) 50vw, 92vw" className="h-auto w-full drop-shadow-[0_40px_40px_rgba(11,31,58,0.25)]" />
  ) : (
    <div className="relative">
      <IsoVilla className="h-auto w-full" title={t("renderSoon")} />
      <span className="absolute right-[12%] bottom-[8%] rounded-full border border-gold/40 bg-white/80 px-3 py-1 text-[10px] font-bold tracking-[0.16em] text-gold-dark uppercase backdrop-blur">
        {t("renderSoon")}
      </span>
    </div>
  );

  return (
    <section ref={sectionRef} className="relative px-2 pt-[68px] sm:px-3 lg:pt-[84px]" aria-labelledby="hero-title">
      <div className="relative isolate overflow-hidden rounded-[2rem] bg-[radial-gradient(120%_80%_at_80%_10%,#ffffff_0%,#f6f1e7_45%,#ece4d4_100%)] lg:rounded-[2.75rem]">
        {/* soft gold glow */}
        <div aria-hidden className="pointer-events-none absolute -top-40 right-[-10%] -z-10 size-[42rem] rounded-full bg-gold/15 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute bottom-[-30%] left-[-10%] -z-10 size-[36rem] rounded-full bg-white/70 blur-3xl" />

        {/* Giant word — desktop: full width at the top */}
        <motion.div
          aria-hidden
          style={{ x: wordX, y: wordY }}
          className="pointer-events-none absolute inset-x-0 top-2 -z-10 hidden justify-center select-none lg:flex"
        >
          <span className="hero-rise font-display block bg-gradient-to-b from-navy/90 via-navy/45 to-navy/0 bg-clip-text text-[clamp(9rem,23.5vw,25rem)] leading-[0.82] tracking-[0.01em] text-transparent">
            PERDOMO
          </span>
        </motion.div>

        <motion.div
          style={{ opacity: contentOpacity }}
          className="container-x grid grid-cols-1 [grid-template-areas:'title'_'villa'_'search'_'ctas'] gap-y-6 pt-8 pb-8 sm:pt-10 lg:min-h-[min(860px,calc(100svh-100px))] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:[grid-template-areas:'title_villa'_'search_villa'_'ctas_villa'] lg:content-end lg:gap-x-10 lg:gap-y-6 lg:pt-0 lg:pb-14"
        >
          {/* Title */}
          <div className="[grid-area:title] lg:max-w-2xl">
            <p className="hero-fade eyebrow mb-3 flex items-center gap-3" style={{ animationDelay: "0.1s" }}>
              <span className="h-px w-8 bg-gold" aria-hidden />
              {t("eyebrow")}
            </p>
            <h1 id="hero-title" className="hero-rise text-[2.75rem] leading-[0.92] text-navy min-[390px]:text-[3.1rem] sm:text-6xl lg:text-[3.5rem] xl:text-[4.5rem] 2xl:text-[5.2rem]">
              {title}
            </h1>
            <p className="hero-fade mt-4 max-w-md text-[0.95rem] leading-relaxed text-navy-soft sm:text-base" style={{ animationDelay: "0.35s" }}>
              {subtitle}
            </p>
          </div>

          {/* Villa (+ mobile giant word behind it) */}
          <div className="relative [grid-area:villa] lg:self-center">
            <span
              aria-hidden
              className="font-display pointer-events-none absolute inset-x-0 top-[6%] -z-10 block overflow-hidden bg-gradient-to-b from-navy/85 via-navy/35 to-navy/0 bg-clip-text text-center text-[23vw] leading-[0.85] text-transparent select-none lg:hidden"
            >
              PERDOMO
            </span>
            <motion.div style={{ y: villaY }} className="mx-auto w-[92%] max-w-[560px] pt-[9vw] sm:pt-12 lg:w-full lg:max-w-none lg:pt-[7vw]">
              <motion.div style={{ x: sx, y: sy }}>
                <div className="hero-scale" style={{ animationDelay: "0.15s" }}>
                  <div className={reduce ? "" : "animate-float"}>{villa}</div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Search */}
          <div className="hero-fade relative z-10 [grid-area:search] lg:w-[min(40rem,52vw)]" style={{ animationDelay: "0.5s" }}>
            <div className="hidden lg:block">
              <HeroSearchDesktop zones={zones} />
              <QuickChips className="mt-3 pl-2" />
            </div>
            <div className="lg:hidden">
              <HeroSearchMobile zones={zones} />
            </div>
          </div>

          {/* CTAs */}
          <div className="hero-fade flex flex-col gap-3 [grid-area:ctas] sm:flex-row" style={{ animationDelay: "0.65s" }}>
            <Magnetic className="w-full sm:w-auto">
              <Link href="/properties" className="btn btn-navy w-full sm:w-auto">
                {tc("exploreProperties")}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Magnetic>
            <Magnetic className="w-full sm:w-auto">
              <button type="button" onClick={() => openLeadModal({ type: "price" })} className="btn btn-gold w-full uppercase sm:w-auto">
                {tc("askPricesLong")}
              </button>
            </Magnetic>
          </div>
        </motion.div>

        <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] font-bold tracking-[0.3em] text-stone uppercase xl:flex" aria-hidden>
          {t("scroll")}
          <ArrowDown className="size-3.5 animate-bounce" />
        </div>
      </div>
    </section>
  );
}
