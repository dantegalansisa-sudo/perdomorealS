"use client";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Expand, X, ZoomIn, ZoomOut } from "lucide-react";
import { ImagePlaceholder } from "@/components/ui/Media";
import type { MediaItem } from "@/lib/types";
import { cn, tr } from "@/lib/utils";

/** 16:9 main image + thumbnails, with a fullscreen lightbox (keyboard, swipe, click/pinch zoom). */
export function Gallery({ media, title }: { media: MediaItem[]; title: string }) {
  const t = useTranslations("tools.gallery");
  const locale = useLocale();
  const images = media.filter((m) => m.kind === "image" && !!m.url);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const thumbs = useRef<HTMLDivElement>(null);
  const count = images.length;

  const go = useCallback((dir: number) => setIndex((i) => (count ? (i + dir + count) % count : 0)), [count]);

  useEffect(() => {
    const el = thumbs.current?.querySelector<HTMLElement>(`[data-index="${index}"]`);
    el?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [index]);

  if (count === 0) {
    return (
      <div className="space-y-3">
        <ImagePlaceholder ratio="16/9" className="rounded-3xl" />
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <ImagePlaceholder key={i} ratio="4/3" compact className="rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const altOf = (m: MediaItem, i: number) => tr(m.alt, locale) || t("imageAlt", { title, n: i + 1 });
  const current = images[Math.min(index, count - 1)];

  return (
    <div className="space-y-3">
      <div className="group relative aspect-video overflow-hidden rounded-3xl bg-sand-2">
        <button type="button" onClick={() => setOpen(true)} className="absolute inset-0 block h-full w-full cursor-zoom-in" aria-label={t("open")}>
          <Image src={current.url} alt={altOf(current, index)} fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
        </button>
        {count > 1 && (
          <>
            <NavButton side="left" label={t("prev")} onClick={() => go(-1)} />
            <NavButton side="right" label={t("next")} onClick={() => go(1)} />
          </>
        )}
        <div className="pointer-events-none absolute right-3 bottom-3 flex items-center gap-2">
          <span className="rounded-full bg-navy/70 px-3 py-1 text-xs font-bold text-white tabular-nums backdrop-blur">{t("counter", { current: index + 1, total: count })}</span>
          <span className="grid size-8 place-items-center rounded-full bg-white/85 text-navy backdrop-blur">
            <Expand className="size-4" aria-hidden />
          </span>
        </div>
      </div>
      {count > 1 && (
        <div ref={thumbs} className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {images.map((m, i) => (
            <button
              key={m.id}
              type="button"
              data-index={i}
              onClick={() => setIndex(i)}
              aria-label={t("thumbnail", { n: i + 1 })}
              aria-current={i === index}
              className={cn(
                "relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-xl bg-sand-2 ring-2 ring-offset-2 ring-offset-sand transition sm:w-28",
                i === index ? "ring-gold" : "opacity-70 ring-transparent hover:opacity-100"
              )}
            >
              <Image src={m.url} alt="" fill sizes="120px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
      <Lightbox open={open} onClose={() => setOpen(false)} images={images} index={index} setIndex={setIndex} title={title} altOf={altOf} />
    </div>
  );
}

function NavButton({ side, label, onClick }: { side: "left" | "right"; label: string; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "absolute top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-navy shadow-lg backdrop-blur transition hover:bg-white",
        side === "left" ? "left-3" : "right-3"
      )}
    >
      <Icon className="size-5" aria-hidden />
    </button>
  );
}

function Lightbox({
  open,
  onClose,
  images,
  index,
  setIndex,
  title,
  altOf,
}: {
  open: boolean;
  onClose: () => void;
  images: MediaItem[];
  index: number;
  setIndex: (fn: (i: number) => number) => void;
  title: string;
  altOf: (m: MediaItem, i: number) => string;
}) {
  const t = useTranslations("tools.gallery");
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [scale, setScale] = useState(1);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const closeRef = useRef<HTMLButtonElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number; dist: number; startScale: number; moved: boolean } | null>(null);
  const count = images.length;

  useEffect(() => setMounted(true), []);
  const go = useCallback(
    (dir: number) => {
      setScale(1);
      setIndex((i) => (i + dir + count) % count);
    },
    [count, setIndex]
  );

  useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      setScale(1);
      prevFocus?.focus?.();
    };
  }, [open, onClose, go]);

  const pointFromEvent = (clientX: number, clientY: number) => {
    const r = stage.current?.getBoundingClientRect();
    if (!r) return { x: 50, y: 50 };
    return { x: ((clientX - r.left) / r.width) * 100, y: ((clientY - r.top) / r.height) * 100 };
  };

  const toggleZoom = (clientX: number, clientY: number) => {
    if (scale > 1) setScale(1);
    else {
      setOrigin(pointFromEvent(clientX, clientY));
      setScale(2.2);
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const [a, b] = [e.touches[0], e.touches[1]];
      touch.current = { x: 0, y: 0, dist: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), startScale: scale, moved: true };
      setOrigin(pointFromEvent((a.clientX + b.clientX) / 2, (a.clientY + b.clientY) / 2));
    } else {
      touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, dist: 0, startScale: scale, moved: false };
    }
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const s = touch.current;
    if (!s) return;
    if (e.touches.length === 2 && s.dist > 0) {
      const [a, b] = [e.touches[0], e.touches[1]];
      const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      setScale(Math.min(4, Math.max(1, s.startScale * (d / s.dist))));
    } else if (e.touches.length === 1) {
      const dx = e.touches[0].clientX - s.x;
      const dy = e.touches[0].clientY - s.y;
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) s.moved = true;
      if (scale > 1) setOrigin(pointFromEvent(e.touches[0].clientX, e.touches[0].clientY));
    }
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const s = touch.current;
    touch.current = null;
    if (!s || s.dist > 0 || scale > 1) return;
    const end = e.changedTouches[0];
    const dx = end.clientX - s.x;
    const dy = end.clientY - s.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.2) go(dx < 0 ? 1 : -1);
  };

  if (!mounted) return null;
  const current = images[Math.min(index, count - 1)];

  return createPortal(
    <AnimatePresence>
      {open && current && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          data-lenis-prevent
          className="fixed inset-0 z-[95] flex flex-col bg-navy/95 text-white backdrop-blur-sm"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between gap-3 px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-3 sm:px-6">
            <p className="min-w-0 truncate text-sm font-semibold text-white/80">
              <span className="mr-3 font-bold text-gold tabular-nums">{t("counter", { current: index + 1, total: count })}</span>
              {altOf(current, index)}
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => (scale > 1 ? setScale(1) : setScale(2.2))}
                aria-label={scale > 1 ? t("zoomOut") : t("zoomIn")}
                className="grid size-10 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
              >
                {scale > 1 ? <ZoomOut className="size-5" aria-hidden /> : <ZoomIn className="size-5" aria-hidden />}
              </button>
              <button ref={closeRef} type="button" onClick={onClose} aria-label={t("close")} className="grid size-10 place-items-center rounded-full bg-white/10 transition hover:bg-white/20">
                <X className="size-5" aria-hidden />
              </button>
            </div>
          </div>
          <div
            ref={stage}
            className="relative min-h-0 flex-1 touch-none overflow-hidden select-none"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onMouseMove={(e) => scale > 1 && setOrigin(pointFromEvent(e.clientX, e.clientY))}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={current.id}
                className="absolute inset-0"
                initial={reduce ? false : { opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  type="button"
                  aria-label={scale > 1 ? t("zoomOut") : t("zoomIn")}
                  onClick={(e) => {
                    if (touch.current?.moved) return;
                    toggleZoom(e.clientX, e.clientY);
                  }}
                  className={cn("absolute inset-0 block h-full w-full", scale > 1 ? "cursor-zoom-out" : "cursor-zoom-in")}
                >
                  <span
                    className="absolute inset-0 block transition-transform duration-300 ease-out"
                    style={{ transform: `scale(${scale})`, transformOrigin: `${origin.x}% ${origin.y}%` }}
                  >
                    <Image src={current.url} alt={altOf(current, index)} fill sizes="100vw" className="object-contain" />
                  </span>
                </button>
              </motion.div>
            </AnimatePresence>
            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label={t("prev")}
                  className="absolute top-1/2 left-3 z-10 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 transition hover:bg-white/20 sm:grid"
                >
                  <ChevronLeft className="size-6" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label={t("next")}
                  className="absolute top-1/2 right-3 z-10 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 transition hover:bg-white/20 sm:grid"
                >
                  <ChevronRight className="size-6" aria-hidden />
                </button>
              </>
            )}
          </div>
          {count > 1 && (
            <div className="no-scrollbar flex justify-start gap-2 overflow-x-auto px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:justify-center">
              {images.map((m, i) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setScale(1);
                    setIndex(() => i);
                  }}
                  aria-label={t("thumbnail", { n: i + 1 })}
                  aria-current={i === index}
                  className={cn("relative aspect-[4/3] w-16 shrink-0 overflow-hidden rounded-lg ring-2 transition", i === index ? "ring-gold" : "opacity-50 ring-transparent hover:opacity-90")}
                >
                  <Image src={m.url} alt="" fill sizes="64px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
