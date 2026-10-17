"use client";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { Bath, BedDouble, CalendarDays, Hand, MousePointerClick, Ruler, Trees, X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Price } from "@/components/ui/Price";
import { PlaceholderBadge } from "@/components/ui/PlaceholderBadge";
import { formatNumber } from "@/lib/format";
import { useStore } from "@/lib/stores";
import type { Unit, UnitStatus, VillaModel } from "@/lib/types";
import { openLeadModal } from "@/lib/ui-store";
import { cn } from "@/lib/utils";
import { buildMasterplan, PLAN } from "./masterplan-geometry";
import { selectUnit, unitSelection } from "./selection-store";

export const STATUS_COLOR: Record<UnitStatus, string> = { available: "#3f8f6b", reserved: "#d29a2e", sold: "#b4534b" };
export const STATUSES: UnitStatus[] = ["available", "reserved", "sold"];
const ZOOMS = [1, 1.5, 2, 2.75];

export function useIsDesktop(query = "(min-width: 1024px)") {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
}

export function StatusPill({ status, className }: { status: UnitStatus; className?: string }) {
  const t = useTranslations("common");
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide whitespace-nowrap", className)}
      style={{ background: `${STATUS_COLOR[status]}1f`, color: STATUS_COLOR[status] }}
    >
      <span className="size-1.5 rounded-full" style={{ background: STATUS_COLOR[status] }} aria-hidden />
      {t(`unitStatus.${status}`)}
    </span>
  );
}

/** Interactive SVG site plan with status colors, filters, tooltip, zoom and a detail panel / bottom sheet. */
export function Masterplan({ projectId, projectName, units, models }: { projectId: string; projectName: string; units: Unit[]; models: VillaModel[] }) {
  const t = useTranslations("project.masterplan");
  const tc = useTranslations("common");
  const locale = useLocale();
  const geo = useMemo(() => buildMasterplan(units), [units]);
  const byId = useMemo(() => new Map(units.map((u) => [u.id, u])), [units]);
  const modelById = useMemo(() => new Map(models.map((m) => [m.id, m])), [models]);
  const { id: selectedId } = useStore(unitSelection);
  const [status, setStatus] = useState<UnitStatus | "all">("all");
  const [model, setModel] = useState<string>("all");
  const [hovered, setHovered] = useState<string | null>(null);
  const [zoomIdx, setZoomIdx] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);
  const centerRatio = useRef<{ x: number; y: number } | null>(null);
  const isDesktop = useIsDesktop();

  const counts = useMemo(() => {
    const c: Record<UnitStatus, number> = { available: 0, reserved: 0, sold: 0 };
    units.forEach((u) => c[u.status]++);
    return c;
  }, [units]);

  const matches = (u: Unit) => (status === "all" || u.status === status) && (model === "all" || u.model_id === model);
  const selected = selectedId ? byId.get(selectedId) ?? null : null;
  const hoveredUnit = hovered ? byId.get(hovered) ?? null : null;
  const hoveredLot = hovered ? geo.lots.find((l) => l.id === hovered) : null;

  // Center horizontally on first paint (mobile has a wider-than-viewport plan).
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
  }, []);

  useLayoutEffect(() => {
    const el = scroller.current;
    const r = centerRatio.current;
    if (!el || !r) return;
    el.scrollLeft = r.x * el.scrollWidth - el.clientWidth / 2;
    el.scrollTop = r.y * el.scrollHeight - el.clientHeight / 2;
    centerRatio.current = null;
  }, [zoomIdx]);

  const zoom = (next: number) => {
    const el = scroller.current;
    if (el) centerRatio.current = { x: (el.scrollLeft + el.clientWidth / 2) / el.scrollWidth, y: (el.scrollTop + el.clientHeight / 2) / el.scrollHeight };
    setZoomIdx(Math.max(0, Math.min(ZOOMS.length - 1, next)));
  };

  const z = ZOOMS[zoomIdx];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
      <div className="min-w-0">
        {/* Filters */}
        <div className="mb-4 space-y-3">
          <div role="group" aria-label={t("filterStatus")} className="flex flex-wrap gap-2">
            <button type="button" className="chip" data-active={status === "all"} aria-pressed={status === "all"} onClick={() => setStatus("all")}>
              {t("all")} <span className="text-stone tabular-nums">{units.length}</span>
            </button>
            {STATUSES.map((s) => (
              <button key={s} type="button" className="chip" data-active={status === s} aria-pressed={status === s} onClick={() => setStatus(status === s ? "all" : s)}>
                <span className="size-2.5 rounded-full" style={{ background: STATUS_COLOR[s] }} aria-hidden />
                {tc(`unitStatus.${s}`)} <span className="text-stone tabular-nums">{counts[s]}</span>
              </button>
            ))}
          </div>
          {models.length > 1 && (
            <div role="group" aria-label={t("filterModel")} className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
              <button type="button" className="chip shrink-0" data-active={model === "all"} aria-pressed={model === "all"} onClick={() => setModel("all")}>
                {t("allModels")}
              </button>
              {models.map((m) => (
                <button key={m.id} type="button" className="chip shrink-0" data-active={model === m.id} aria-pressed={model === m.id} onClick={() => setModel(model === m.id ? "all" : m.id)}>
                  {m.name}
                  <span className="text-stone">· {tc("specs.bedrooms", { count: m.bedrooms })}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Plan */}
        <div className="relative overflow-hidden rounded-3xl border border-line bg-[#efe9dc]">
          <div ref={scroller} data-lenis-prevent className="no-scrollbar max-h-[78vh] overflow-auto overscroll-contain">
            <div
              className="relative w-[max(calc(var(--z)*100%),calc(var(--z)*720px))] lg:w-[calc(var(--z)*100%)]"
              style={{ "--z": z } as React.CSSProperties}
            >
              <svg viewBox={`0 0 ${PLAN.W} ${PLAN.H}`} className="block h-auto w-full" role="group" aria-label={t("planAria", { name: projectName })} style={{ fontFamily: "var(--font-sans)" }}>
                <PlanBackdrop geo={geo} labels={{ clubhouse: t("clubhouse"), pool: t("pool"), entrance: t("entrance"), gate: t("gate"), green: t("green") }} />
                <g>
                  {geo.lots.map((lot) => {
                    const u = byId.get(lot.id);
                    if (!u) return null;
                    const on = matches(u);
                    const isSel = selectedId === u.id;
                    const isHov = hovered === u.id;
                    return (
                      <path
                        key={lot.id}
                        d={lot.d}
                        role="button"
                        tabIndex={0}
                        aria-label={t("lotAria", { code: u.code, status: tc(`unitStatus.${u.status}`) })}
                        aria-pressed={isSel}
                        fill={STATUS_COLOR[u.status]}
                        fillOpacity={isHov || isSel ? 1 : 0.86}
                        stroke={isSel ? "#0b1f3a" : isHov ? "#c9a961" : "#ffffff"}
                        strokeWidth={isSel ? 4 : isHov ? 3.5 : 1.5}
                        strokeLinejoin="round"
                        className="cursor-pointer outline-none transition-[opacity,fill-opacity] duration-300"
                        style={{ opacity: on ? 1 : 0.2 }}
                        onMouseEnter={() => setHovered(u.id)}
                        onMouseLeave={() => setHovered((h) => (h === u.id ? null : h))}
                        onFocus={() => setHovered(u.id)}
                        onBlur={() => setHovered((h) => (h === u.id ? null : h))}
                        onClick={() => selectUnit(u.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            selectUnit(u.id);
                          }
                        }}
                      />
                    );
                  })}
                </g>
                <g pointerEvents="none" aria-hidden>
                  {geo.lots.map((lot) => {
                    const u = byId.get(lot.id);
                    if (!u) return null;
                    return (
                      <text
                        key={lot.id}
                        x={lot.cx}
                        y={lot.cy}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={13}
                        fontWeight={800}
                        fill="#ffffff"
                        style={{ opacity: matches(u) ? 1 : 0.35 }}
                      >
                        {u.lot_number}
                      </text>
                    );
                  })}
                </g>
              </svg>
              {/* Tooltip */}
              <AnimatePresence>
                {hoveredUnit && hoveredLot && (
                  <motion.div
                    key={hoveredUnit.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="pointer-events-none absolute z-10 hidden md:block"
                    style={{ left: `${(hoveredLot.cx / PLAN.W) * 100}%`, top: `${(hoveredLot.cy / PLAN.H) * 100}%` }}
                  >
                    <div className="mb-3 w-max -translate-x-1/2 -translate-y-full rounded-2xl border border-line bg-white px-3.5 py-2.5 text-navy shadow-xl">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-lg tracking-wide">{hoveredUnit.code}</span>
                        <StatusPill status={hoveredUnit.status} />
                      </div>
                      <p className="mt-0.5 text-xs font-semibold text-stone">
                        {hoveredUnit.model_id ? modelById.get(hoveredUnit.model_id)?.name : null}
                        {hoveredUnit.lot_m2 ? ` · ${formatNumber(hoveredUnit.lot_m2, locale)} ${tc("specs.m2")}` : null}
                      </p>
                      <Price usd={hoveredUnit.price} className="mt-1 block text-sm font-extrabold" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          {/* Zoom controls */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-1 rounded-2xl border border-line bg-white/90 p-1 shadow-sm backdrop-blur">
            <ZoomBtn label={t("zoomIn")} onClick={() => zoom(zoomIdx + 1)} disabled={zoomIdx >= ZOOMS.length - 1}>
              <ZoomIn className="size-4" aria-hidden />
            </ZoomBtn>
            <ZoomBtn label={t("zoomOut")} onClick={() => zoom(zoomIdx - 1)} disabled={zoomIdx === 0}>
              <ZoomOut className="size-4" aria-hidden />
            </ZoomBtn>
            <ZoomBtn label={t("resetZoom")} onClick={() => zoom(0)} disabled={zoomIdx === 0}>
              <RotateCcw className="size-4" aria-hidden />
            </ZoomBtn>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-navy-soft">
          {STATUSES.map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5">
              <span className="size-3 rounded-[4px]" style={{ background: STATUS_COLOR[s] }} aria-hidden />
              {tc(`unitStatus.${s}`)}
            </span>
          ))}
          <span className="inline-flex items-center gap-1.5">
            <Trees className="size-3.5 text-[#6f8a5c]" aria-hidden />
            {t("green")}
          </span>
          <span className="inline-flex items-center gap-1.5 md:hidden">
            <Hand className="size-3.5 text-gold-dark" aria-hidden />
            {t("scrollHint")}
          </span>
          <span className="ml-auto font-bold text-navy">{t("summary", { available: counts.available, total: units.length })}</span>
        </div>
      </div>

      {/* Desktop side panel */}
      <aside className="hidden lg:block">
        <div className="sticky top-28 rounded-3xl border border-line bg-white p-6">
          {selected ? (
            <VillaDetails unit={selected} model={selected.model_id ? modelById.get(selected.model_id) ?? null : null} projectId={projectId} projectName={projectName} onClose={() => selectUnit(null)} />
          ) : (
            <div className="py-6 text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-gold-soft/60 text-gold-dark">
                <MousePointerClick className="size-6" aria-hidden />
              </span>
              <p className="mt-4 font-display text-2xl text-navy">{t("selectTitle")}</p>
              <p className="mt-2 text-sm leading-relaxed text-stone">{t("selectPrompt")}</p>
              <dl className="mt-6 grid grid-cols-3 gap-2">
                {STATUSES.map((s) => (
                  <div key={s} className="rounded-2xl bg-sand px-2 py-3">
                    <dd className="font-display text-3xl" style={{ color: STATUS_COLOR[s] }}>
                      {counts[s]}
                    </dd>
                    <dt className="text-[10px] font-bold tracking-wide text-stone uppercase">{tc(`unitStatus.${s}`)}</dt>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile bottom sheet */}
      <BottomSheet open={!!selected && !isDesktop} onClose={() => selectUnit(null)} label={selected?.code ?? ""}>
        {selected && (
          <VillaDetails unit={selected} model={selected.model_id ? modelById.get(selected.model_id) ?? null : null} projectId={projectId} projectName={projectName} onClose={() => selectUnit(null)} />
        )}
      </BottomSheet>
    </div>
  );
}

function ZoomBtn({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} disabled={disabled} className="grid size-9 place-items-center rounded-xl text-navy transition hover:bg-sand-2 disabled:opacity-35">
      {children}
    </button>
  );
}

/** Villa detail card used by the desktop panel and the mobile bottom sheet. */
export function VillaDetails({
  unit,
  model,
  projectId,
  projectName,
  onClose,
}: {
  unit: Unit;
  model: VillaModel | null;
  projectId: string;
  projectName: string;
  onClose?: () => void;
}) {
  const t = useTranslations("project.masterplan");
  const tc = useTranslations("common");
  const locale = useLocale();
  const interest = `${projectName} — ${unit.code}`;
  const sold = unit.status === "sold";
  const lead = (type: "price" | "visit") => {
    onClose?.();
    openLeadModal({ type, projectId, interest: sold ? projectName : interest });
  };
  const specs = [
    { icon: BedDouble, label: tc("specs.bedroomsShort"), value: model ? String(model.bedrooms) : "—" },
    { icon: Bath, label: tc("specs.bathroomsShort"), value: model ? formatNumber(model.bathrooms, locale) : "—" },
    { icon: Ruler, label: tc("specs.built"), value: unit.built_m2 ? `${formatNumber(unit.built_m2, locale)} ${tc("specs.m2")}` : "—" },
    { icon: Trees, label: tc("specs.lot"), value: unit.lot_m2 ? `${formatNumber(unit.lot_m2, locale)} ${tc("specs.m2")}` : "—" },
  ];
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">{t("lot", { number: unit.lot_number })}</p>
          <p className="mt-1 font-display text-5xl text-navy">{unit.code}</p>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} aria-label={t("close")} className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-navy transition hover:border-gold">
            <X className="size-4" aria-hidden />
          </button>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <StatusPill status={unit.status} />
        {model && (
          <span className="rounded-full bg-sand-2 px-2.5 py-1 text-[11px] font-bold text-navy-soft">
            {t("model")} {model.name}
          </span>
        )}
        <PlaceholderBadge show={unit.is_placeholder} />
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-2">
        {specs.map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-2xl bg-sand px-3 py-3">
            <dt className="flex items-center gap-1.5 text-[10px] font-bold tracking-wide text-stone uppercase">
              <Icon className="size-3.5 text-gold-dark" aria-hidden />
              {label}
            </dt>
            <dd className="mt-1 text-base font-extrabold text-navy tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-line pt-4">
        <span className="text-xs font-bold tracking-[0.18em] text-stone uppercase">{t("price")}</span>
        <Price usd={sold ? null : unit.price} className="text-2xl font-extrabold text-navy" />
      </div>
      {sold && <p className="mt-3 rounded-2xl bg-sold/10 p-3 text-sm text-navy-soft">{t("soldNotice")}</p>}
      <div className="mt-5 grid gap-2">
        <button type="button" onClick={() => lead("price")} className="btn btn-gold w-full whitespace-normal text-center">
          {sold ? t("askSimilar") : t("requestVillaPrice")}
        </button>
        <button type="button" onClick={() => lead("visit")} className="btn btn-ghost w-full whitespace-normal text-center">
          <CalendarDays className="size-4" aria-hidden />
          {tc("scheduleVisit")}
        </button>
      </div>
    </div>
  );
}

function BottomSheet({ open, onClose, label, children }: { open: boolean; onClose: () => void; label: string; children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[72] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <button type="button" aria-hidden tabIndex={-1} className="absolute inset-0 h-full w-full bg-navy/40 backdrop-blur-[2px]" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={label}
            data-lenis-prevent
            className="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-[2rem] bg-white px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl"
            initial={reduce ? false : { y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            drag={reduce ? false : "y"}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) onClose();
            }}
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-line" aria-hidden />
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/** Static scenery: land, perimeter wall, loop street, entrance, central park, clubhouse, pool and compass. */
function PlanBackdrop({ geo, labels }: { geo: ReturnType<typeof buildMasterplan>; labels: { clubhouse: string; pool: string; entrance: string; gate: string; green: string } }) {
  const { W, H, CX, CY, A, B, STREET } = PLAN;
  return (
    <g aria-hidden>
      <defs>
        <pattern id="mp-grass" width="14" height="14" patternUnits="userSpaceOnUse">
          <rect width="14" height="14" fill="#e3e6cf" />
          <circle cx="3" cy="4" r="0.9" fill="#c9d0ad" />
          <circle cx="10" cy="10" r="0.9" fill="#c9d0ad" />
        </pattern>
        <linearGradient id="mp-pool" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#8fd0dc" />
          <stop offset="1" stopColor="#4ba3b8" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="#efe9dc" />
      {geo.trees.map((tr, i) => (
        <g key={i}>
          <circle cx={tr.x} cy={tr.y} r={tr.r} fill="#9fb38a" fillOpacity={0.75} />
          <circle cx={tr.x - tr.r * 0.3} cy={tr.y - tr.r * 0.3} r={tr.r * 0.45} fill="#b8c9a3" fillOpacity={0.8} />
        </g>
      ))}
      {/* Perimeter wall + inner land */}
      <path d={geo.wallPath} fill="#f6f2ea" stroke="#cdbd9c" strokeWidth={5} />
      {/* Loop street */}
      <ellipse cx={CX} cy={CY} rx={A} ry={B} fill="none" stroke="#d9cfbd" strokeWidth={STREET + 6} />
      <ellipse cx={CX} cy={CY} rx={A} ry={B} fill="none" stroke="#ffffff" strokeWidth={STREET} />
      <ellipse cx={CX} cy={CY} rx={A} ry={B} fill="none" stroke="#c9a961" strokeOpacity={0.55} strokeWidth={1.5} strokeDasharray="10 12" />
      {/* Entrance road + gate */}
      <rect x={CX - STREET / 2 - 3} y={CY + B} width={STREET + 6} height={H - CY - B} fill="#d9cfbd" />
      <rect x={CX - STREET / 2} y={CY + B} width={STREET} height={H - CY - B} fill="#ffffff" />
      <line x1={CX} x2={CX} y1={CY + B + 20} y2={H} stroke="#c9a961" strokeOpacity={0.55} strokeWidth={1.5} strokeDasharray="10 12" />
      <rect x={CX + STREET / 2 + 8} y={H - 42} width={34} height={24} rx={4} fill="#0b1f3a" />
      <line x1={CX - STREET / 2} x2={CX + STREET / 2} y1={H - 30} y2={H - 30} stroke="#c9a961" strokeWidth={3} strokeLinecap="round" />
      <text x={CX + STREET / 2 + 50} y={H - 25} fontSize={13} fontWeight={700} fill="#7b7468">
        {labels.gate}
      </text>
      <text x={CX - STREET / 2 - 10} y={H - 14} fontSize={14} fontWeight={800} fill="#0b1f3a" textAnchor="end" letterSpacing={2}>
        {labels.entrance.toUpperCase()} ↑
      </text>
      {/* Central park */}
      <path d={geo.lawnPath} fill="url(#mp-grass)" stroke="#c9d0ad" strokeWidth={2} />
      <rect x={CX - 12} y={CY + 82} width={24} height={B - STREET / 2 - 82} fill="#f6f2ea" />
      {geo.parkTrees.map((tr, i) => (
        <g key={i}>
          <circle cx={tr.x} cy={tr.y} r={tr.r} fill="#8aa378" />
          <circle cx={tr.x - tr.r * 0.3} cy={tr.y - tr.r * 0.3} r={tr.r * 0.45} fill="#a7bd93" />
        </g>
      ))}
      <text x={CX - 210} y={CY + 6} fontSize={13} fontWeight={700} fill="#5f7a4f" textAnchor="middle" letterSpacing={1.5}>
        {labels.green.toUpperCase()}
      </text>
      <text x={CX + 210} y={CY + 6} fontSize={13} fontWeight={700} fill="#5f7a4f" textAnchor="middle" letterSpacing={1.5}>
        {labels.green.toUpperCase()}
      </text>
      {/* Clubhouse */}
      <rect x={CX - 100} y={CY - 88} width={200} height={170} rx={18} fill="#f6f2ea" stroke="#e6e0d4" strokeWidth={2} />
      <rect x={CX - 78} y={CY - 76} width={156} height={58} rx={8} fill="#0b1f3a" />
      <text x={CX} y={CY - 42} fontSize={15} fontWeight={800} fill="#c9a961" textAnchor="middle" letterSpacing={2}>
        {labels.clubhouse.toUpperCase()}
      </text>
      <rect x={CX - 80} y={CY - 6} width={160} height={52} rx={22} fill="url(#mp-pool)" stroke="#ffffff" strokeWidth={4} />
      <text x={CX} y={CY + 25} fontSize={13} fontWeight={800} fill="#ffffff" textAnchor="middle" letterSpacing={2}>
        {labels.pool.toUpperCase()}
      </text>
      {/* Compass */}
      <g transform={`translate(${W - 66} 66)`}>
        <circle r={30} fill="#ffffff" stroke="#e6e0d4" strokeWidth={2} />
        <path d="M0 -22 L7 4 L0 0 L-7 4 Z" fill="#0b1f3a" />
        <path d="M0 22 L7 -4 L0 0 L-7 -4 Z" fill="#c9a961" />
        <text y={-34} fontSize={13} fontWeight={800} fill="#0b1f3a" textAnchor="middle">
          N
        </text>
      </g>
    </g>
  );
}
