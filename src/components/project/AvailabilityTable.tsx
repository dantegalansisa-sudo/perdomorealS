"use client";
import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useReducedMotion } from "motion/react";
import { ArrowDown, ArrowUp, ArrowUpDown, Bath, BedDouble, MapPin, Ruler, RotateCcw, Trees } from "lucide-react";
import { Price } from "@/components/ui/Price";
import { formatNumber } from "@/lib/format";
import type { Unit, UnitStatus, VillaModel } from "@/lib/types";
import { openLeadModal } from "@/lib/ui-store";
import { cn } from "@/lib/utils";
import { useMoney } from "@/components/tools/shared";
import { STATUS_COLOR, STATUS_INK, STATUSES, StatusPill } from "./Masterplan";
import { selectUnit } from "./selection-store";

type SortKey = "code" | "model" | "bedrooms" | "bathrooms" | "built" | "lot" | "price" | "status";
type Row = Unit & { modelName: string; bedrooms: number; bathrooms: number };
const STATUS_ORDER: Record<UnitStatus, number> = { available: 0, reserved: 1, sold: 2 };
const PAGE = 15;
const PRICE_STEP = 25000;

/** Filterable, sortable unit list. Table on desktop, cards on mobile. */
export function AvailabilityTable({ projectId, projectName, units, models }: { projectId: string; projectName: string; units: Unit[]; models: VillaModel[] }) {
  const t = useTranslations("project.availability");
  const tc = useTranslations("common");
  const locale = useLocale();
  const money = useMoney();
  const reduce = useReducedMotion();

  const rows = useMemo<Row[]>(() => {
    const byId = new Map(models.map((m) => [m.id, m]));
    return units.map((u) => {
      const m = u.model_id ? byId.get(u.model_id) : undefined;
      return { ...u, modelName: m?.name ?? "—", bedrooms: m?.bedrooms ?? 0, bathrooms: m?.bathrooms ?? 0 };
    });
  }, [units, models]);

  const prices = rows.map((r) => r.price).filter((p): p is number => p != null);
  const pMin = prices.length ? Math.floor(Math.min(...prices) / PRICE_STEP) * PRICE_STEP : 0;
  const pMax = prices.length ? Math.ceil(Math.max(...prices) / PRICE_STEP) * PRICE_STEP : 0;
  const priceSteps: number[] = [];
  for (let p = pMin; p <= pMax && priceSteps.length < 60; p += PRICE_STEP) priceSteps.push(p);
  const bedOptions = [...new Set(rows.map((r) => r.bedrooms).filter(Boolean))].sort((a, b) => a - b);

  const [status, setStatus] = useState<UnitStatus | "all">("all");
  const [model, setModel] = useState("all");
  const [beds, setBeds] = useState("all");
  const [minP, setMinP] = useState("");
  const [maxP, setMaxP] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "code", dir: 1 });
  const [visible, setVisible] = useState(PAGE);

  const counts = useMemo(() => {
    const c: Record<UnitStatus, number> = { available: 0, reserved: 0, sold: 0 };
    rows.forEach((r) => c[r.status]++);
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    const list = rows.filter(
      (r) =>
        (status === "all" || r.status === status) &&
        (model === "all" || r.model_id === model) &&
        (beds === "all" || r.bedrooms === Number(beds)) &&
        (minP === "" || (r.price ?? 0) >= Number(minP)) &&
        (maxP === "" || (r.price ?? Infinity) <= Number(maxP))
    );
    const val = (r: Row): number | string => {
      switch (sort.key) {
        case "code":
          return r.lot_number;
        case "model":
          return r.modelName;
        case "bedrooms":
          return r.bedrooms;
        case "bathrooms":
          return r.bathrooms;
        case "built":
          return r.built_m2 ?? 0;
        case "lot":
          return r.lot_m2 ?? 0;
        case "price":
          return r.price ?? Number.MAX_SAFE_INTEGER;
        case "status":
          return STATUS_ORDER[r.status];
      }
    };
    return [...list].sort((a, b) => {
      const va = val(a);
      const vb = val(b);
      const cmp = typeof va === "string" ? va.localeCompare(String(vb)) : va - (vb as number);
      return cmp * sort.dir || a.lot_number - b.lot_number;
    });
  }, [rows, status, model, beds, minP, maxP, sort]);

  const dirty = status !== "all" || model !== "all" || beds !== "all" || minP !== "" || maxP !== "";
  const reset = () => {
    setStatus("all");
    setModel("all");
    setBeds("all");
    setMinP("");
    setMaxP("");
    setVisible(PAGE);
  };
  const toggleSort = (key: SortKey) => setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: 1 }));
  const ask = (r: Row) => openLeadModal({ type: "price", projectId, interest: r.status === "sold" ? projectName : `${projectName} — ${r.code}` });
  const viewOnPlan = (r: Row) => {
    selectUnit(r.id);
    document.getElementById("masterplan")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };
  const m2 = (v: number | null) => (v ? `${formatNumber(v, locale)} ${tc("specs.m2")}` : "—");
  const shown = filtered.slice(0, visible);

  const columns: { key: SortKey; label: string; align?: "right" }[] = [
    { key: "code", label: t("columns.code") },
    { key: "model", label: t("columns.model") },
    { key: "bedrooms", label: t("columns.bedrooms"), align: "right" },
    { key: "bathrooms", label: t("columns.bathrooms"), align: "right" },
    { key: "built", label: t("columns.built"), align: "right" },
    { key: "lot", label: t("columns.lot"), align: "right" },
    { key: "price", label: t("columns.price"), align: "right" },
    { key: "status", label: t("columns.status") },
  ];

  return (
    <div>
      {/* Summary */}
      <dl className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-2xl border border-line bg-white px-4 py-3">
          <dt className="text-[11px] font-bold tracking-[0.16em] text-stone uppercase">{t("total")}</dt>
          <dd className="font-display text-3xl text-navy">{rows.length}</dd>
        </div>
        {STATUSES.map((s) => (
          <div key={s} className="rounded-2xl border border-line bg-white px-4 py-3">
            <dt className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.16em] text-stone uppercase">
              <span className="size-2 rounded-full" style={{ background: STATUS_COLOR[s] }} aria-hidden />
              {tc(`unitStatus.${s}`)}
            </dt>
            <dd className="font-display text-3xl" style={{ color: STATUS_INK[s] }}>
              {counts[s]}
            </dd>
          </div>
        ))}
      </dl>

      {/* Filters */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <FilterSelect label={t("status")} value={status} onChange={(v) => (setStatus(v as UnitStatus | "all"), setVisible(PAGE))}>
          <option value="all">{t("any")}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {tc(`unitStatus.${s}`)}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect label={t("model")} value={model} onChange={(v) => (setModel(v), setVisible(PAGE))}>
          <option value="all">{t("any")}</option>
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect label={t("bedrooms")} value={beds} onChange={(v) => (setBeds(v), setVisible(PAGE))}>
          <option value="all">{t("any")}</option>
          {bedOptions.map((b) => (
            <option key={b} value={b}>
              {tc("specs.bedrooms", { count: b })}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect label={t("priceMin")} value={minP} onChange={(v) => (setMinP(v), setVisible(PAGE))}>
          <option value="">{t("any")}</option>
          {priceSteps.slice(0, -1).map((p) => (
            <option key={p} value={p}>
              {money.fmt(p)}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect label={t("priceMax")} value={maxP} onChange={(v) => (setMaxP(v), setVisible(PAGE))} className="col-span-2 lg:col-span-1">
          <option value="">{t("any")}</option>
          {priceSteps.slice(1).map((p) => (
            <option key={p} value={p}>
              {money.fmt(p)}
            </option>
          ))}
        </FilterSelect>
      </div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-bold text-navy" aria-live="polite">
          {t("results", { count: filtered.length })}
        </p>
        {dirty && (
          <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 text-sm font-bold text-gold-dark hover:text-navy">
            <RotateCcw className="size-3.5" aria-hidden />
            {t("reset")}
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-line bg-white p-8 text-center text-stone">{t("none")}</p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="relative hidden overflow-x-auto rounded-3xl border border-line bg-white md:block">
            <table className="w-full text-sm">
              <thead className="bg-sand-2/70 text-left">
                <tr>
                  {columns.map((c) => {
                    const active = sort.key === c.key;
                    const Icon = active ? (sort.dir === 1 ? ArrowUp : ArrowDown) : ArrowUpDown;
                    return (
                      <th key={c.key} scope="col" aria-sort={active ? (sort.dir === 1 ? "ascending" : "descending") : "none"} className={cn("px-4 py-3", c.align === "right" && "text-right")}>
                        <button
                          type="button"
                          onClick={() => toggleSort(c.key)}
                          aria-label={t("sortBy", { column: c.label })}
                          className={cn(
                            "inline-flex items-center gap-1 text-[11px] font-bold tracking-[0.14em] uppercase transition-colors",
                            active ? "text-navy" : "text-stone hover:text-navy"
                          )}
                        >
                          {c.label}
                          <Icon className={cn("size-3", !active && "opacity-50")} aria-hidden />
                        </button>
                      </th>
                    );
                  })}
                  <th scope="col" className="px-4 py-3 text-right text-[11px] font-bold tracking-[0.14em] text-stone uppercase">
                    <span className="sr-only">{t("columns.action")}</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {shown.map((r) => (
                  <tr key={r.id} className="transition-colors hover:bg-sand/70">
                    <td className="px-4 py-3">
                      <span className="font-display text-lg text-navy">{r.code}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-navy-soft">{r.modelName}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{r.bedrooms || "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{r.bathrooms ? formatNumber(r.bathrooms, locale) : "—"}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap tabular-nums">{m2(r.built_m2)}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap tabular-nums">{m2(r.lot_m2)}</td>
                    <td className="px-4 py-3 text-right font-bold whitespace-nowrap text-navy tabular-nums">
                      {r.status === "sold" ? <span className="text-stone-light">—</span> : <Price usd={r.price} />}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={r.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button type="button" onClick={() => viewOnPlan(r)} className="grid size-9 place-items-center rounded-full border border-line text-navy transition hover:border-gold" aria-label={`${t("viewOnPlan")} ${r.code}`} title={t("viewOnPlan")}>
                          <MapPin className="size-4" aria-hidden />
                        </button>
                        <button type="button" onClick={() => ask(r)} className="btn btn-navy btn-sm">
                          {t("ask")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="grid gap-3 md:hidden">
            {shown.map((r) => (
              <li key={r.id} className="rounded-3xl border border-line bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-2xl text-navy">{r.code}</p>
                    <p className="text-xs font-semibold text-stone">
                      {t("model")} {r.modelName}
                    </p>
                  </div>
                  <StatusPill status={r.status} />
                </div>
                <dl className="mt-3 grid grid-cols-4 gap-2 text-center">
                  {[
                    { icon: BedDouble, label: tc("specs.bedroomsShort"), v: String(r.bedrooms || "—") },
                    { icon: Bath, label: tc("specs.bathroomsShort"), v: r.bathrooms ? formatNumber(r.bathrooms, locale) : "—" },
                    { icon: Ruler, label: tc("specs.built"), v: r.built_m2 ? formatNumber(r.built_m2, locale) : "—" },
                    { icon: Trees, label: tc("specs.lot"), v: r.lot_m2 ? formatNumber(r.lot_m2, locale) : "—" },
                  ].map(({ icon: Icon, label, v }) => (
                    <div key={label} className="rounded-xl bg-sand px-1 py-2">
                      <dt className="sr-only">{label}</dt>
                      <Icon className="mx-auto size-3.5 text-gold-dark" aria-hidden />
                      <dd className="mt-0.5 text-sm font-extrabold text-navy tabular-nums">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate text-lg font-extrabold text-navy">{r.status === "sold" ? <span className="text-stone-light">—</span> : <Price usd={r.price} />}</span>
                  <div className="flex shrink-0 gap-1.5">
                    <button type="button" onClick={() => viewOnPlan(r)} className="grid size-10 place-items-center rounded-full border border-line text-navy" aria-label={`${t("viewOnPlan")} ${r.code}`}>
                      <MapPin className="size-4" aria-hidden />
                    </button>
                    <button type="button" onClick={() => ask(r)} className="btn btn-navy btn-sm">
                      {t("ask")}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {visible < filtered.length && (
            <div className="mt-6 flex justify-center">
              <button type="button" onClick={() => setVisible((v) => v + PAGE * 2)} className="btn btn-ghost">
                {t("showMore")} <span className="text-stone tabular-nums">({filtered.length - visible})</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function FilterSelect({ label, value, onChange, children, className }: { label: string; value: string; onChange: (v: string) => void; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block min-w-0", className)}>
      <span className="label">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="field py-2.5">
        {children}
      </select>
    </label>
  );
}
