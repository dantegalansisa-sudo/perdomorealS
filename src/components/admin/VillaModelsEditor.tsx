"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BedDouble, ChevronDown, Plus, Trash2 } from "lucide-react";
import { deleteVillaModel, saveVillaModel } from "@/app/admin/_actions/projects";
import { modelToForm, type ModelForm } from "@/lib/admin/defaults";
import type { I18nText, VillaModel } from "@/lib/types";
import { cn } from "@/lib/utils";
import { I18nField, NumberField, TextField, Toggle, type FieldErrors } from "./fields";
import { Repeater } from "./Repeater";
import { MediaManager } from "./MediaManager";
import { useToast } from "./Toast";

type ModelRow = { key: string; id: string | null; form: ModelForm; media: VillaModel["media"] };

export function VillaModelsEditor({ projectId, models }: { projectId: string; models: VillaModel[] }) {
  const [rows, setRows] = useState<ModelRow[]>(() =>
    models.map((m) => ({ key: m.id, id: m.id, form: modelToForm(m), media: m.media ?? [] }))
  );
  const [openKey, setOpenKey] = useState<string | null>(null);

  function addModel() {
    const key = `new-${Date.now()}`;
    setRows((r) => [
      ...r,
      {
        key,
        id: null,
        media: [],
        form: {
          project_id: projectId,
          code: String.fromCharCode(65 + r.length),
          name: "",
          bedrooms: 3,
          bathrooms: 3,
          built_m2: 0,
          lot_m2: 0,
          price_from: null,
          description: { es: "", en: "" },
          features: [],
          sort: r.length,
          is_placeholder: false,
        },
      },
    ]);
    setOpenKey(key);
  }

  return (
    <div className="space-y-3">
      {rows.length === 0 && <p className="rounded-2xl border border-dashed border-line px-4 py-6 text-center text-sm text-stone">Este proyecto aún no tiene modelos de villa.</p>}
      {rows.map((row) => (
        <ModelCard
          key={row.key}
          row={row}
          open={openKey === row.key}
          onToggle={() => setOpenKey(openKey === row.key ? null : row.key)}
          onSaved={(m) => setRows((rs) => rs.map((r) => (r.key === row.key ? { ...r, id: m.id, form: modelToForm(m) } : r)))}
          onDeleted={() => setRows((rs) => rs.filter((r) => r.key !== row.key))}
        />
      ))}
      <button type="button" className="btn btn-ghost btn-sm" onClick={addModel}>
        <Plus className="size-4" /> Añadir modelo
      </button>
    </div>
  );
}

function ModelCard({
  row,
  open,
  onToggle,
  onSaved,
  onDeleted,
}: {
  row: ModelRow;
  open: boolean;
  onToggle: () => void;
  onSaved: (m: VillaModel) => void;
  onDeleted: () => void;
}) {
  const toast = useToast();
  const router = useRouter();
  const [form, setForm] = useState<ModelForm>(row.form);
  const [errors, setErrors] = useState<FieldErrors>();
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof ModelForm>(k: K, v: ModelForm[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    setSaving(true);
    const res = await saveVillaModel(row.id, form);
    setSaving(false);
    setErrors(res.ok ? undefined : res.fieldErrors);
    toast.result(res);
    if (res.ok && res.data) {
      onSaved(res.data);
      router.refresh();
    }
  }

  async function remove() {
    if (!row.id) return onDeleted();
    if (!confirm(`¿Eliminar el modelo “${form.name || form.code}”? Las unidades asignadas quedarán sin modelo.`)) return;
    const res = await deleteVillaModel(row.id);
    if (toast.result(res)) onDeleted();
  }

  return (
    <div className={cn("overflow-hidden rounded-2xl border bg-white", open ? "border-gold" : "border-line")}>
      <button type="button" onClick={onToggle} className="flex w-full items-center gap-3 px-4 py-3 text-left">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-navy font-display text-lg text-gold">{form.code || "?"}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-bold text-navy">{form.name || "Nuevo modelo"}</span>
          <span className="flex items-center gap-2 text-xs text-stone">
            <BedDouble className="size-3.5" /> {form.bedrooms} hab · {form.bathrooms} baños · {form.built_m2} m²
            {form.price_from ? ` · desde US$${Number(form.price_from).toLocaleString("en-US")}` : ""}
            {!row.id && <span className="font-bold text-gold-dark">· sin guardar</span>}
          </span>
        </span>
        <ChevronDown className={cn("size-4 text-stone transition-transform", open && "rotate-180")} />
      </button>
      <div className={open ? "block" : "hidden"}>
          <div>
            <div className="space-y-4 border-t border-line p-4">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <TextField label="Código *" value={form.code} onChange={(v) => set("code", v)} error={errors?.code} />
                <TextField label="Nombre *" value={form.name} onChange={(v) => set("name", v)} error={errors?.name} className="col-span-1 md:col-span-3" />
                <NumberField label="Habitaciones" value={form.bedrooms} onChange={(v) => set("bedrooms", Math.round(v ?? 0))} step={1} min={0} />
                <NumberField label="Baños" value={form.bathrooms} onChange={(v) => set("bathrooms", v ?? 0)} step={0.5} min={0} />
                <NumberField label="Construcción" suffix="m²" value={form.built_m2} onChange={(v) => set("built_m2", v ?? 0)} min={0} />
                <NumberField label="Solar" suffix="m²" value={form.lot_m2} onChange={(v) => set("lot_m2", v ?? 0)} min={0} />
                <NumberField label="Precio desde (USD)" value={form.price_from} onChange={(v) => set("price_from", v)} nullable className="col-span-2" />
                <NumberField label="Orden" value={form.sort} onChange={(v) => set("sort", Math.round(v ?? 0))} step={1} />
              </div>
              <I18nField label="Descripción" value={form.description} onChange={(v) => set("description", v)} multiline rows={3} />
              <div>
                <span className="label">Características</span>
                <Repeater<I18nText>
                  items={form.features}
                  onChange={(v) => set("features", v)}
                  newItem={() => ({ es: "", en: "" })}
                  addLabel="Añadir característica"
                  empty="Sin características."
                  render={(f, update) => <I18nField label="" value={f} onChange={(v) => update(v)} />}
                />
              </div>
              <Toggle checked={form.is_placeholder} onChange={(v) => set("is_placeholder", v)} label="Información de ejemplo" />
              <div className="flex flex-wrap justify-between gap-2 border-t border-line pt-4">
                <button type="button" onClick={remove} className="btn btn-sm text-red-600 hover:bg-red-50">
                  <Trash2 className="size-4" /> Eliminar modelo
                </button>
                <button type="button" onClick={save} disabled={saving} className="btn btn-navy btn-sm disabled:opacity-60">
                  {saving ? "Guardando…" : row.id ? "Guardar modelo" : "Crear modelo"}
                </button>
              </div>
              {row.id ? (
                <div className="rounded-2xl border border-line bg-sand/40 p-4">
                  <MediaManager
                    ownerType="model"
                    ownerId={row.id}
                    initialItems={row.media ?? []}
                    allowFloorplan
                    title="Imágenes y planos del modelo"
                    description="Usa el botón de capas para marcar una imagen como plano (floorplan)."
                  />
                </div>
              ) : (
                <p className="text-xs text-stone">Guarda el modelo para poder subir imágenes y planos.</p>
              )}
            </div>
          </div>
      </div>
    </div>
  );
}
