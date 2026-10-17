"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { IsoVilla } from "@/components/ui/IsoVilla";
import { Magnetic } from "@/components/motion/Magnetic";
import { openLeadModal } from "@/lib/ui-store";
import { HeroSearchDesktop, HeroSearchMobile, QuickChips } from "./HeroSearch";

/**
 * Giant "REAL ESTATE" word. Rendered as SVG text with textLength so it always spans the
 * container exactly (spacing adjusts, glyphs never stretch) with a clean silver fade.
 */
function GiantWord() {
  return (
    <svg viewBox="0 0 1000 226" className="block h-auto w-full" aria-hidden focusable="false">
      <defs>
        <linearGradient id="hero-word-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="0.6" stopColor="#c9d4e3" stopOpacity="0.5" />
          <stop offset="1" stopColor="#c9d4e3" stopOpacity="0" />
        </linearGradient>
      </defs>
      <text
        x="0"
        y="222"
        textLength="1000"
        lengthAdjust="spacing"
        fill="url(#hero-word-fade)"
        style={{ fontFamily: "var(--font-display)", fontSize: 248, letterSpacing: "-0.045em" }}
      >
        REAL ESTATE
      </text>
    </svg>
  );
}

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
  const wordX = useTransform(sx, (v) => v * -0.25);

  // Scroll parallax
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const villaY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 90]);
  const wordY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 50]);

  useEffect(() => {
    if (reduce || !window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      mx.set((e.clientX / window.innerWidth - 0.5) * 26);
      my.set((e.clientY / window.innerHeight - 0.5) * 16);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my, reduce]);

  const villa = villaSrc ? (
    <div className="relative">
      {/* warm light behind the house + soft contact shadow so it sits on the navy background */}
      <div aria-hidden className="pointer-events-none absolute inset-x-[12%] top-[18%] bottom-[22%] -z-10 rounded-full bg-[radial-gradient(closest-side,rgba(232,186,110,0.38),rgba(232,186,110,0.12)_55%,transparent)] blur-2xl" />
      <div aria-hidden className="pointer-events-none absolute inset-x-[8%] -bottom-[3%] -z-10 h-[14%] rounded-[50%] bg-black/45 blur-2xl" />
      <Image
        src={villaSrc}
        alt={t("villaAlt")}
        width={1448}
        height={1039}
        priority
        fetchPriority="high"
        sizes="(min-width: 1280px) 46vw, (min-width: 1024px) 50vw, 92vw"
        className="h-auto w-full drop-shadow-[0_30px_40px_rgba(0,0,0,0.35)]"
      />
    </div>
  ) : (
    <div className="relative">
      <IsoVilla onDark className="h-auto w-full" title={t("renderSoon")} />
      <span className="absolute right-[10%] bottom-[6%] rounded-full border border-white/25 bg-navy/70 px-3 py-1 text-[10px] font-bold tracking-[0.16em] text-white uppercase backdrop-blur">
        {t("renderSoon")}
      </span>
    </div>
  );

  return (
    <section ref={sectionRef} className="relative px-2 pt-[76px] sm:px-3 lg:pt-[84px]" aria-labelledby="hero-title">
      <div className="relative isolate overflow-hidden rounded-[2rem] bg-[radial-gradient(120%_90%_at_78%_0%,#1d3d68_0%,#0b1f3a_52%,#06142a_100%)] text-white lg:rounded-[2.75rem]">
        {/* atmosphere: soft gold light + fine grid */}
        <div aria-hidden className="pointer-events-none absolute -top-48 right-[-8%] -z-10 size-[44rem] rounded-full bg-gold/15 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute bottom-[-35%] left-[-15%] -z-10 size-[40rem] rounded-full bg-[#2c5a92]/25 blur-3xl" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(80%_70%_at_50%_30%,#000,transparent)]"
        />

        <div className="container-x pt-7 pb-8 sm:pt-9 lg:pt-10 lg:pb-14">
          {/* Brand line above the giant word */}
          <div className="hero-fade flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
            <p className="flex items-center gap-3 text-[11px] font-bold tracking-[0.32em] text-gold uppercase sm:text-xs">
              <span className="h-px w-8 bg-gold" aria-hidden />
              Perdomo
              <span className="hidden text-white/40 sm:inline">·</span>
              <span className="hidden tracking-[0.22em] text-white/60 sm:inline">{t("eyebrow")}</span>
            </p>
            <p className="hidden text-xs font-semibold tracking-[0.18em] text-white/55 uppercase md:block">{tc("slogan")}</p>
          </div>

          {/* Giant word */}
          <motion.div style={{ x: wordX, y: wordY }} className="hero-rise relative mt-3 sm:mt-4">
            <GiantWord />
          </motion.div>

          <div className="relative grid grid-cols-1 gap-x-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)]">
            {/* Villa — overlaps the bottom of the giant word, like the reference */}
            <div className="relative z-0 -mt-[5vw] sm:-mt-[8vw] lg:order-2 lg:-mt-[15vw] xl:-mt-[14vw]">
              <motion.div style={{ y: villaY }} className="mx-auto w-[96%] max-w-[600px] lg:-mr-[1%] lg:ml-auto lg:w-[108%] lg:max-w-none">
                <motion.div style={{ x: sx, y: sy }}>
                  <div className="hero-scale" style={{ animationDelay: "0.15s" }}>
                    <div className={reduce ? "" : "animate-float"}>{villa}</div>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* Copy, search and CTAs */}
            <div className="relative z-10 -mt-2 lg:order-1 lg:mt-8">
              {/* Mobile/tablet: quiet, refined sans headline. Desktop: condensed display like the reference. */}
              <span aria-hidden className="hero-fade mb-4 block h-px w-10 bg-gold lg:hidden" />
              <h1
                id="hero-title"
                className="hero-rise max-w-[22rem] font-sans text-[1.55rem] leading-[1.2] font-light tracking-[-0.01em] text-white/95 normal-case min-[390px]:text-[1.7rem] sm:max-w-md sm:text-[2rem] lg:max-w-none lg:font-display lg:text-[3rem] lg:leading-[0.95] lg:font-normal lg:tracking-[0.005em] lg:text-white lg:uppercase xl:text-[3.6rem] 2xl:text-[4.1rem]"
              >
                {title}
              </h1>
              <p className="hero-fade mt-3 max-w-lg text-[0.9rem] leading-relaxed text-white/60 sm:text-base lg:mt-4 lg:text-white/70" style={{ animationDelay: "0.3s" }}>
                {subtitle}
              </p>

              <div className="hero-fade mt-7 lg:w-[min(40rem,48vw)]" style={{ animationDelay: "0.45s" }}>
                <div className="hidden lg:block">
                  <HeroSearchDesktop zones={zones} />
                  <QuickChips dark className="mt-3 pl-2" />
                </div>
                <div className="lg:hidden">
                  <HeroSearchMobile zones={zones} />
                </div>
              </div>

              <div className="hero-fade mt-7 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: "0.6s" }}>
                <Magnetic className="w-full sm:w-auto">
                  <Link href="/properties" className="btn w-full bg-white text-navy hover:bg-gold-soft sm:w-auto">
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
              <p className="mt-5 text-xs font-semibold tracking-[0.16em] text-white/50 uppercase md:hidden">{tc("slogan")}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
