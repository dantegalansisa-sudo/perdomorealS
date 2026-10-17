"use client";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

/** Generic repeatable-rows editor with add / move / remove. */
export function Repeater<T>({
  items,
  onChange,
  newItem,
  addLabel = "Añadir",
  empty = "Sin elementos todavía.",
  render,
  footer,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  newItem: () => T;
  addLabel?: string;
  empty?: string;
  render: (item: T, update: (patch: Partial<T>) => void, index: number) => React.ReactNode;
  footer?: (item: T, index: number) => React.ReactNode;
}) {
  const update = (i: number, patch: Partial<T>) => onChange(items.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="space-y-3">
      {items.length === 0 && <p className="rounded-2xl border border-dashed border-line px-4 py-5 text-center text-sm text-stone">{empty}</p>}
      {items.map((item, i) => (
        <div key={i} className="relative rounded-2xl border border-line bg-sand/50 p-4 pr-12">
          {render(item, (patch) => update(i, patch), i)}
          {footer?.(item, i)}
          <div className="absolute right-2 top-2 flex flex-col gap-1">
            <button type="button" title="Subir" onClick={() => move(i, -1)} disabled={i === 0} className="grid size-7 place-items-center rounded-lg text-stone hover:bg-white hover:text-navy disabled:opacity-30">
              <ChevronUp className="size-4" />
            </button>
            <button
              type="button"
              title="Bajar"
              onClick={() => move(i, 1)}
              disabled={i === items.length - 1}
              className="grid size-7 place-items-center rounded-lg text-stone hover:bg-white hover:text-navy disabled:opacity-30"
            >
              <ChevronDown className="size-4" />
            </button>
            <button type="button" title="Eliminar" onClick={() => onChange(items.filter((_, j) => j !== i))} className="grid size-7 place-items-center rounded-lg text-stone hover:bg-red-50 hover:text-red-600">
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, newItem()])} className="btn btn-ghost btn-sm">
        <Plus className="size-4" /> {addLabel}
      </button>
    </div>
  );
}
