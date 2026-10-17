"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Move, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import type { MediaItem } from "@/lib/types";
import { cn, tr } from "@/lib/utils";

const MIN = 1;
const MAX = 4;

/** 1:1 floor plan frame with zoom buttons, double-click zoom and drag-to-pan. */
export function FloorplanViewer({ plans, title }: { plans: MediaItem[]; title: string }) {
  const t = useTranslations("tools.floorplan");
  const locale = useLocale();
  const list = plans.filter((p) => !!p.url);
  const [active, setActive] = useState(0);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const frame = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  const clampPos = (p: { x: number; y: number }, s: number) => {
    const size = frame.current?.clientWidth ?? 400;
    const lim = ((s - 1) * size) / 2;
    return { x: Math.max(-lim, Math.min(lim, p.x)), y: Math.max(-lim, Math.min(lim, p.y)) };
  };
  const zoomTo = (s: number) => {
    const next = Math.max(MIN, Math.min(MAX, s));
    setScale(next);
    setPos((p) => (next === 1 ? { x: 0, y: 0 } : clampPos(p, next)));
  };
  const reset = () => {
    setScale(1);
    setPos({ x: 0, y: 0 });
  };

  const controls = (
    <div className="absolute right-3 bottom-3 z-10 flex items-center gap-1 rounded-full border border-line bg-white/90 p-1 shadow-sm backdrop-blur">
      <CtrlButton label={t("zoomOut")} onClick={() => zoomTo(scale - 0.5)} disabled={scale <= MIN}>
        <ZoomOut className="size-4" aria-hidden />
      </CtrlButton>
      <span className="w-10 text-center text-[11px] font-bold text-navy tabular-nums" aria-live="polite">
        {Math.round(scale * 100)}%
      </span>
      <CtrlButton label={t("zoomIn")} onClick={() => zoomTo(scale + 0.5)} disabled={scale >= MAX}>
        <ZoomIn className="size-4" aria-hidden />
      </CtrlButton>
      <CtrlButton label={t("reset")} onClick={reset} disabled={scale === 1}>
        <RotateCcw className="size-4" aria-hidden />
      </CtrlButton>
    </div>
  );

  if (list.length === 0) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-line bg-white">
        <BlueprintPlaceholder />
        <div className="absolute inset-x-0 bottom-0 flex justify-center p-4">
          <span className="rounded-full border border-gold/40 bg-white/90 px-4 py-1.5 text-[11px] font-semibold tracking-[0.18em] text-stone uppercase backdrop-blur">
            {t("soon")}
          </span>
        </div>
      </div>
    );
  }

  const current = list[Math.min(active, list.length - 1)];

  return (
    <div>
      <div
        ref={frame}
        data-lenis-prevent
        className={cn(
          "relative aspect-square overflow-hidden rounded-3xl border border-line bg-white select-none",
          scale > 1 ? (dragging ? "cursor-grabbing" : "cursor-grab") : "cursor-zoom-in",
          scale > 1 && "touch-none"
        )}
        onDoubleClick={() => (scale > 1 ? reset() : zoomTo(2))}
        onPointerDown={(e) => {
          if (scale <= 1 || (e.target as HTMLElement).closest("button")) return;
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          drag.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y };
          setDragging(true);
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          setPos(clampPos({ x: d.px + (e.clientX - d.x), y: d.py + (e.clientY - d.y) }, scale));
        }}
        onPointerUp={() => {
          drag.current = null;
          setDragging(false);
        }}
        onPointerCancel={() => {
          drag.current = null;
          setDragging(false);
        }}
      >
        <div
          className={cn("absolute inset-0", !dragging && "transition-transform duration-300 ease-out")}
          style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0) scale(${scale})` }}
        >
          <Image
            src={current.url}
            alt={tr(current.alt, locale) || t("alt", { title })}
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="pointer-events-none object-contain p-4"
            draggable={false}
          />
        </div>
        {scale > 1 && (
          <span className="pointer-events-none absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-navy/80 px-3 py-1 text-[11px] font-bold text-white">
            <Move className="size-3" aria-hidden />
            {t("dragHint")}
          </span>
        )}
        {controls}
      </div>
      {list.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {list.map((p, i) => (
            <button
              key={p.id}
              type="button"
              data-active={i === active}
              onClick={() => {
                setActive(i);
                reset();
              }}
              className="chip"
            >
              {tr(p.alt, locale) || t("plan", { n: i + 1 })}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CtrlButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="grid size-8 place-items-center rounded-full text-navy transition hover:bg-sand-2 disabled:opacity-35"
    >
      {children}
    </button>
  );
}

/** Stylised blueprint drawing used until the real floor plan is uploaded. */
function BlueprintPlaceholder() {
  return (
    <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <pattern id="fp-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="#c9a961" strokeOpacity="0.18" strokeWidth="0.6" />
        </pattern>
      </defs>
      <rect width="400" height="400" fill="#fbf9f5" />
      <rect width="400" height="400" fill="url(#fp-grid)" />
      <g fill="none" stroke="#0b1f3a" strokeOpacity="0.28" strokeLinecap="square">
        <path d="M60 70H340V300H230V330H60Z" strokeWidth="6" />
        <path d="M200 70V180M60 180H150M180 180H260M290 180H340M140 180V330M260 180V250M260 280V300" strokeWidth="3" />
        <path d="M150 180A30 30 0 0 1 180 150M260 250A30 30 0 0 1 290 280" strokeWidth="1.2" strokeDasharray="3 3" />
      </g>
      <rect x="240" y="315" width="90" height="50" rx="6" fill="#c9a961" fillOpacity="0.15" stroke="#c9a961" strokeOpacity="0.5" />
      <g fill="#0b1f3a" fillOpacity="0.35" fontFamily="sans-serif" fontSize="9" fontWeight="700" letterSpacing="1.5">
        <text x="100" y="128">01</text>
        <text x="262" y="128">02</text>
        <text x="90" y="262">03</text>
        <text x="190" y="248">04</text>
        <text x="292" y="232">05</text>
      </g>
    </svg>
  );
}
