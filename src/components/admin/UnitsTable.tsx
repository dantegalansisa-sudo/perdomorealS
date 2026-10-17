"use client";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { addUnit, bulkUnitStatus, deleteUnits, generateUnits, updateUnit } from "@/app/admin/_actions/units";
import { UNIT_STATUS, UNIT_STATUS_COLOR } from "@/lib/admin/constants";
import type { Unit, UnitStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useToast } from "./Toast";

type ModelOpt = { id: string; code: string; name: string };

const STATUS_STYLE: Record<UnitStatus, string> = {
  available: "border-emerald-200 bg-emerald-50 text-emerald-800",
  reserved: "border-amber-200 bg-amber-50 text-amber-800",
  sold: "border-red-200 bg-red-50 text-red-800",
};

export function UnitsTable({
  projectId,
  totalUnits,
  initialUnits,
  models,
}: {
  projectId: string;
  totalUnits: number;
  initialUnits: Unit[];
  models: ModelOpt[];
}) {
  const toast = useToast();
  const router = useRouter();
  const [units, setUnits] = useState<Unit[]>(initialUnits);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<UnitStatus | "">("");
  const [modelFilter, setModelFilter] = useState<string>("");
  const [query, setQuery] = useState("");
  const [pending, start] = useTransition();

  const counts = useMemo(() => {
    const c: Record<UnitStatus, number> = { available: 0, reserved: 0, sold: 0 };
    units.forEach((u) => c[u.status]++);
    return c;
  }, [units]);

  const visible = units.filter(
    (u) =>
      (!statusFilter || u.status === statusFilter) &&
      (!modelFilter || (modelFilter === "none" ? !u.model_id : u.model_id === modelFilter)) &&
      (!query || u.code.toLowerCase().includes(query.toLowerCase()) || String(u.lot_number) === query.trim())
  );
  const allVisibleSelected = visible.length > 0 && visible.every((u) => selected.has(u.id));

  async function patch(id: string, p: Partial<Unit>) {
    const prev = units;
    setUnits((l) => l.map((u) => (u.id === id ? { ...u, ...p } : u)));
    const res = await updateUnit(id, p);
    if (!res.ok) {
      toast.error(res.error);
      setUnits(prev);
    }
  }

  function bulk(status: UnitStatus) {
    const ids = [...selected];
    if (!ids.length) return;
    start(async () => {
      const res = await bulkUnitStatus(ids, status);
      if (toast.result(res)) {
        setUnits((l) => l.map((u) => (selected.has(u.id) ? { ...u, status } : u)));
        setSelected(new Set());
      }
    });
  }

  function removeSelected() {
    const ids = [...selected];
    if (!ids.length || !confirm(`¿Eliminar ${ids.length} unidad(es)? Esta acción no se puede deshacer.`)) return;
    start(async () => {
      const res = await deleteUnits(ids);
      if (toast.result(res)) {
        setUnits((l) => l.filter((u) => !selected.has(u.id)));
        setSelected(new Set());
      }
    });
  }

  function add() {
    start(async () => {
      const res = await addUnit(projectId);
      toast.result(res);
      if (res.ok && res.data) setUnits((l) => [...l, res.data!]);
    });
  }

  if (units.length === 0) return <GenerateUnits projectId={projectId} totalUnits={totalUnits} models={models} onDone={() => router.refresh()} />;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button onClick={() => setStatusFilter("")} className={cn("card p-4 text-left", !statusFilter && "border-navy")}>
          <p className="font-display text-3xl">{units.length}</p>
          <p className="text-xs font-bold text-stone">Total</p>
        </button>
        {(Object.keys(UNIT_STATUS) as UnitStatus[]).map((s) => (
          <button key={s} onClick={() => setStatusFilter(statusFilter === s ? "" : s)} className={cn("card p-4 text-left", statusFilter === s && "border-navy")}>
            <div className="flex items-center justify-between">
              <p className="font-display text-3xl">{counts[s]}</p>
              <span className={cn("size-3 rounded", UNIT_STATUS_COLOR[s])} />
            </div>
            <p className="text-xs font-bold text-stone">
              {UNIT_STATUS[s]} · {Math.round((counts[s] / units.length) * 100)}%
            </p>
          </button>
        ))}
      </div>

      {/* Filters + bulk */}
      <div className="card flex flex-wrap items-end gap-3 p-4">
        <div className="min-w-[140px] flex-1">
          <label className="label">Buscar</label>
          <input className="field !py-2" placeholder="Código o lote" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div>
          <label className="label">Estado</label>
          <select className="field !py-2" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as UnitStatus | "")}>
            <option value="">Todos</option>
            {(Object.keys(UNIT_STATUS) as UnitStatus[]).map((s) => (
              <option key={s} value={s}>
                {UNIT_STATUS[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Modelo</label>
          <select className="field !py-2" value={modelFilter} onChange={(e) => setModelFilter(e.target.value)}>
            <option value="">Todos</option>
            <option value="none">Sin modelo</option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.code} · {m.name}
              </option>
            ))}
          </select>
        </div>
        <button onClick={add} disabled={pending} className="btn btn-ghost btn-sm">
          <Plus className="size-4" /> Unidad
        </button>
      </div>

      {selected.size > 0 && (
        <div className="sticky top-16 z-20 flex flex-wrap items-center gap-2 rounded-2xl border border-gold bg-gold-soft px-4 py-3 shadow-lg">
          <span className="text-sm font-extrabold text-navy">{selected.size} seleccionada(s)</span>
          <span className="text-xs text-navy-soft">Cambiar a:</span>
          {(Object.keys(UNIT_STATUS) as UnitStatus[]).map((s) => (
            <button key={s} disabled={pending} onClick={() => bulk(s)} className={cn("rounded-full border px-3 py-1 text-xs font-extrabold disabled:opacity-60", STATUS_STYLE[s])}>
              {UNIT_STATUS[s]}
            </button>
          ))}
          <span className="ml-auto flex items-center gap-2">
            {pending && <Loader2 className="size-4 animate-spin" />}
            <button onClick={removeSelected} disabled={pending} className="inline-flex items-center gap-1 text-xs font-bold text-red-700 hover:underline">
              <Trash2 className="size-3.5" /> Eliminar
            </button>
            <button onClick={() => setSelected(new Set())} className="text-xs font-bold text-navy-soft hover:underline">
              Limpiar
            </button>
          </span>
        </div>
      )}

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="border-b border-line bg-sand/60">
              <tr className="text-left text-[11px] font-extrabold uppercase tracking-wider text-stone">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    className="size-4 accent-[var(--color-navy)]"
                    checked={allVisibleSelected}
                    onChange={(e) => {
                      const next = new Set(selected);
                      visible.forEach((u) => (e.target.checked ? next.add(u.id) : next.delete(u.id)));
                      setSelected(next);
                    }}
                    aria-label="Seleccionar todo"
                  />
                </th>
                <th className="px-2 py-3">Código</th>
                <th className="px-2 py-3">Lote</th>
                <th className="px-2 py-3">Modelo</th>
                <th className="px-2 py-3">Estado</th>
                <th className="px-2 py-3">Precio (USD)</th>
                <th className="px-2 py-3">Solar m²</th>
                <th className="px-2 py-3 pr-4">Constr. m²</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visible.map((u) => (
                <tr key={u.id} className={cn("hover:bg-sand/40", selected.has(u.id) && "bg-gold-soft/30")}>
                  <td className="px-4 py-1.5">
                    <input
                      type="checkbox"
                      className="size-4 accent-[var(--color-navy)]"
                      checked={selected.has(u.id)}
                      onChange={(e) => {
                        const next = new Set(selected);
                        if (e.target.checked) next.add(u.id);
                        else next.delete(u.id);
                        setSelected(next);
                      }}
                      aria-label={`Seleccionar ${u.code}`}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <Cell value={u.code} onCommit={(v) => v && patch(u.id, { code: v })} className="w-24 font-bold" />
                  </td>
                  <td className="px-2 py-1.5">
                    <Cell value={String(u.lot_number)} type="number" onCommit={(v) => v !== "" && patch(u.id, { lot_number: Math.round(Number(v)) })} className="w-20" />
                  </td>
                  <td className="px-2 py-1.5">
                    <select className={cellCls("w-40")} value={u.model_id ?? ""} onChange={(e) => patch(u.id, { model_id: e.target.value || null })}>
                      <option value="">—</option>
                      {models.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.code} · {m.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-1.5">
                    <select
                      className={cn("rounded-full border px-2.5 py-1 text-xs font-extrabold focus:outline-none", STATUS_STYLE[u.status])}
                      value={u.status}
                      onChange={(e) => patch(u.id, { status: e.target.value as UnitStatus })}
                    >
                      {(Object.keys(UNIT_STATUS) as UnitStatus[]).map((s) => (
                        <option key={s} value={s}>
                          {UNIT_STATUS[s]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-1.5">
                    <Cell value={numStr(u.price)} type="number" onCommit={(v) => patch(u.id, { price: v === "" ? null : Number(v) })} className="w-32" />
                  </td>
                  <td className="px-2 py-1.5">
                    <Cell value={numStr(u.lot_m2)} type="number" onCommit={(v) => patch(u.id, { lot_m2: v === "" ? null : Number(v) })} className="w-24" />
                  </td>
                  <td className="px-2 py-1.5 pr-4">
                    <Cell value={numStr(u.built_m2)} type="number" onCommit={(v) => patch(u.id, { built_m2: v === "" ? null : Number(v) })} className="w-24" />
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-stone">
                    Ninguna unidad coincide con los filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs text-stone">Los cambios se guardan al salir de cada celda y actualizan el masterplan y la disponibilidad del sitio público.</p>
    </div>
  );
}

const numStr = (n: number | null) => (n === null || n === undefined ? "" : String(Number(n)));
const cellCls = (extra?: string) =>
  cn("rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-sm hover:border-line focus:border-gold focus:bg-white focus:outline-none", extra);

function Cell({ value, onCommit, type = "text", className }: { value: string; onCommit: (v: string) => void; type?: string; className?: string }) {
  const [v, setV] = useState(value);
  const [last, setLast] = useState(value);
  if (value !== last) {
    // External update (e.g. revert) → sync local state.
    setLast(value);
    setV(value);
  }
  return (
    <input
      type={type}
      step="any"
      className={cellCls(className)}
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => {
        if (v.trim() !== value) onCommit(v.trim());
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        if (e.key === "Escape") {
          setV(value);
          (e.target as HTMLInputElement).blur();
        }
      }}
    />
  );
}

function GenerateUnits({ projectId, totalUnits, models, onDone }: { projectId: string; totalUnits: number; models: ModelOpt[]; onDone: () => void }) {
  const toast = useToast();
  const [count, setCount] = useState(totalUnits || 89);
  const [prefix, setPrefix] = useState("V-");
  const [startAt, setStartAt] = useState(1);
  const [modelId, setModelId] = useState("");
  const [pending, start] = useTransition();

  return (
    <div className="card mx-auto max-w-xl p-6 text-center sm:p-8">
      <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-gold-soft text-gold-dark">
        <Sparkles className="size-5" />
      </div>
      <h2 className="font-sans text-lg font-extrabold normal-case tracking-normal">Este proyecto no tiene unidades</h2>
      <p className="mt-1 text-sm text-stone">Genera las unidades automáticamente; después podrás editar cada una.</p>
      <div className="mt-6 grid grid-cols-2 gap-3 text-left">
        <div>
          <label className="label">Cantidad</label>
          <input type="number" min={1} max={1000} className="field" value={count} onChange={(e) => setCount(Number(e.target.value))} />
        </div>
        <div>
          <label className="label">Primer lote</label>
          <input type="number" min={0} className="field" value={startAt} onChange={(e) => setStartAt(Number(e.target.value))} />
        </div>
        <div>
          <label className="label">Prefijo del código</label>
          <input className="field" value={prefix} onChange={(e) => setPrefix(e.target.value)} />
        </div>
        <div>
          <label className="label">Modelo por defecto</label>
          <select className="field" value={modelId} onChange={(e) => setModelId(e.target.value)}>
            <option value="">Ninguno</option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.code} · {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="mt-3 text-xs text-stone">
        Vista previa: {prefix}
        {String(startAt).padStart(Math.max(2, String(startAt + count - 1).length), "0")} … {prefix}
        {String(startAt + count - 1).padStart(Math.max(2, String(startAt + count - 1).length), "0")}
      </p>
      <button
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await generateUnits({ projectId, count, prefix, start: startAt, modelId: modelId || null });
            if (toast.result(res)) onDone();
          })
        }
        className="btn btn-gold mt-6 disabled:opacity-60"
      >
        {pending && <Loader2 className="size-4 animate-spin" />} Generar {count} unidades
      </button>
    </div>
  );
}
