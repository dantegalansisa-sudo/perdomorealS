"use client";
import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, GripVertical, ImagePlus, Layers, Loader2, Star, Trash2 } from "lucide-react";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { compressImage, MEDIA_BUCKET, uploadToStorage, uuid } from "@/lib/admin/upload";
import { revalidateSiteAction } from "@/app/admin/_actions/auth";
import type { MediaItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useToast } from "./Toast";

type Upload = { key: string; name: string; progress: number; stage: "compress" | "upload" | "save" | "done" | "error"; error?: string; preview: string };

const STAGE_LABEL: Record<Upload["stage"], string> = {
  compress: "Optimizando…",
  upload: "Subiendo…",
  save: "Guardando…",
  done: "Listo",
  error: "Error",
};

/**
 * Reusable image manager: drag & drop upload (client-side WebP compression), reorder,
 * cover, alt text ES/EN, image/floorplan kind, delete. Writes through the browser client (staff RLS).
 */
export function MediaManager({
  ownerType,
  ownerId,
  initialItems,
  allowFloorplan = false,
  title = "Imágenes",
  description,
}: {
  ownerType: MediaItem["owner_type"];
  ownerId: string;
  initialItems: MediaItem[];
  allowFloorplan?: boolean;
  title?: string;
  description?: string;
}) {
  const toast = useToast();
  const [items, setItems] = useState<MediaItem[]>(() => [...initialItems].sort((a, b) => a.sort - b.sort));
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const revalidate = useCallback(() => {
    void revalidateSiteAction();
  }, []);

  const patchUpload = (key: string, patch: Partial<Upload>) => setUploads((l) => l.map((u) => (u.key === key ? { ...u, ...patch } : u)));

  async function handleFiles(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) {
      toast.error("Selecciona archivos de imagen (JPG, PNG o WebP).");
      return;
    }
    const supabase = createBrowserSupabase();
    const queued: (Upload & { file: File })[] = list.map((file) => ({
      key: uuid(),
      name: file.name,
      progress: 0,
      stage: "compress",
      preview: URL.createObjectURL(file),
      file,
    }));
    setUploads((u) => [...u, ...queued.map(({ file: _f, ...rest }) => rest)]);

    let ok = 0;
    // Sequential keeps memory low with big photos and preserves order.
    for (const q of queued) {
      try {
        const img = await compressImage(q.file);
        patchUpload(q.key, { stage: "upload", progress: 5 });
        const path = `${ownerType}/${ownerId}/${uuid()}.${img.ext}`;
        const { publicUrl } = await uploadToStorage(path, img.blob, img.type, (pct) => patchUpload(q.key, { progress: Math.max(5, Math.round(pct * 0.9)) }));
        patchUpload(q.key, { stage: "save", progress: 95 });
        const current = itemsRef.current;
        const nextSort = current.length ? Math.max(...current.map((i) => i.sort)) + 1 : 0;
        const { data, error } = await supabase
          .from("media")
          .insert({
            owner_type: ownerType,
            owner_id: ownerId,
            url: publicUrl,
            path,
            alt: { es: "", en: "" },
            sort: nextSort,
            is_cover: current.length === 0,
            kind: "image",
            width: img.width,
            height: img.height,
          })
          .select("*")
          .single();
        if (error) {
          await supabase.storage.from(MEDIA_BUCKET).remove([path]);
          throw new Error(error.message);
        }
        setItems((l) => [...l, data as MediaItem]);
        itemsRef.current = [...itemsRef.current, data as MediaItem];
        patchUpload(q.key, { stage: "done", progress: 100 });
        ok++;
      } catch (e) {
        patchUpload(q.key, { stage: "error", error: e instanceof Error ? e.message : "Error al subir" });
      }
    }
    if (ok) {
      toast.success(ok === 1 ? "Imagen subida" : `${ok} imágenes subidas`);
      revalidate();
    }
    if (ok < queued.length) toast.error("Algunas imágenes no se pudieron subir.");
    setTimeout(() => {
      setUploads((l) => l.filter((u) => u.stage === "error" || !queued.some((q) => q.key === u.key)));
      queued.forEach((q) => URL.revokeObjectURL(q.preview));
    }, 1800);
  }

  async function persistOrder(next: MediaItem[]) {
    const prev = items;
    const withSort = next.map((m, i) => ({ ...m, sort: i }));
    setItems(withSort);
    const changed = withSort.filter((m) => prev.find((p) => p.id === m.id)?.sort !== m.sort);
    if (!changed.length) return;
    const supabase = createBrowserSupabase();
    const results = await Promise.all(changed.map((m) => supabase.from("media").update({ sort: m.sort }).eq("id", m.id)));
    if (results.some((r) => r.error)) {
      toast.error("No se pudo guardar el nuevo orden.");
      setItems(prev);
    } else revalidate();
  }

  function move(id: string, dir: -1 | 1) {
    const i = items.findIndex((m) => m.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    void persistOrder(next);
  }

  function dropOn(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const next = [...items];
    const from = next.findIndex((m) => m.id === dragId);
    const to = next.findIndex((m) => m.id === targetId);
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setDragId(null);
    void persistOrder(next);
  }

  async function setCover(id: string) {
    const supabase = createBrowserSupabase();
    const prev = items;
    setItems((l) => l.map((m) => ({ ...m, is_cover: m.id === id })));
    const a = await supabase.from("media").update({ is_cover: false }).eq("owner_type", ownerType).eq("owner_id", ownerId).neq("id", id);
    const b = await supabase.from("media").update({ is_cover: true }).eq("id", id);
    if (a.error || b.error) {
      setItems(prev);
      toast.error("No se pudo marcar como portada.");
    } else {
      toast.success("Portada actualizada");
      revalidate();
    }
  }

  async function updateItem(id: string, patch: Partial<Pick<MediaItem, "alt" | "kind">>, silent = false) {
    const supabase = createBrowserSupabase();
    setItems((l) => l.map((m) => (m.id === id ? { ...m, ...patch } : m)));
    const { error } = await supabase.from("media").update(patch).eq("id", id);
    if (error) toast.error("No se pudo guardar el cambio.");
    else {
      if (!silent) toast.success("Guardado");
      revalidate();
    }
  }

  async function remove(item: MediaItem) {
    if (!confirm("¿Eliminar esta imagen? Esta acción no se puede deshacer.")) return;
    const supabase = createBrowserSupabase();
    const { error } = await supabase.from("media").delete().eq("id", item.id);
    if (error) return toast.error("No se pudo eliminar la imagen.");
    if (item.path) await supabase.storage.from(MEDIA_BUCKET).remove([item.path]);
    const rest = items.filter((m) => m.id !== item.id);
    setItems(rest);
    // Keep a cover if we removed it.
    if (item.is_cover && rest.length) await setCover(rest[0].id);
    toast.success("Imagen eliminada");
    revalidate();
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-sm font-extrabold text-navy">
            {title} <span className="font-semibold text-stone">({items.length})</span>
          </h3>
          {description && <p className="text-xs text-stone">{description}</p>}
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => inputRef.current?.click()}>
          <ImagePlus className="size-4" /> Añadir imágenes
        </button>
      </div>

      <div
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes("Files")) {
            e.preventDefault();
            setDragOver(true);
          }
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          if (e.dataTransfer.files.length) {
            e.preventDefault();
            setDragOver(false);
            void handleFiles(e.dataTransfer.files);
          }
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-colors",
          dragOver ? "border-gold bg-gold-soft/40" : "border-line bg-sand/60 hover:border-gold/60"
        )}
      >
        <ImagePlus className="size-6 text-gold-dark" />
        <p className="text-sm font-bold text-navy">Arrastra imágenes aquí o haz clic para seleccionar</p>
        <p className="text-xs text-stone">Se optimizan automáticamente a WebP (máx. 2400 px)</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) void handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      <AnimatePresence>
        {uploads.length > 0 && (
          <motion.ul initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-3 space-y-2 overflow-hidden">
            {uploads.map((u) => (
              <li key={u.key} className="flex items-center gap-3 rounded-xl border border-line bg-white p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u.preview} alt="" className="size-10 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-2 text-xs">
                    <span className="truncate font-semibold">{u.name}</span>
                    <span className={cn("shrink-0 font-bold", u.stage === "error" ? "text-red-600" : "text-stone")}>
                      {u.stage === "error" ? u.error : `${STAGE_LABEL[u.stage]} ${u.stage === "upload" ? `${u.progress}%` : ""}`}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-sand-2">
                    <div
                      className={cn("h-full rounded-full transition-all", u.stage === "error" ? "bg-red-400" : u.stage === "done" ? "bg-available" : "bg-gold")}
                      style={{ width: `${u.stage === "error" ? 100 : u.progress}%` }}
                    />
                  </div>
                </div>
                {u.stage === "error" && (
                  <button type="button" className="text-xs font-bold text-stone hover:text-navy" onClick={() => setUploads((l) => l.filter((x) => x.key !== u.key))}>
                    Quitar
                  </button>
                )}
                {(u.stage === "compress" || u.stage === "save") && <Loader2 className="size-4 animate-spin text-stone" />}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {items.length > 0 && (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((m, idx) => (
            <li
              key={m.id}
              draggable
              onDragStart={(e) => {
                setDragId(m.id);
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", m.id);
              }}
              onDragEnd={() => setDragId(null)}
              onDragOver={(e) => {
                if (dragId) e.preventDefault();
              }}
              onDrop={(e) => {
                if (dragId) {
                  e.preventDefault();
                  e.stopPropagation();
                  dropOn(m.id);
                }
              }}
              className={cn(
                "overflow-hidden rounded-2xl border bg-white transition-all",
                m.is_cover ? "border-gold ring-2 ring-gold/30" : "border-line",
                dragId === m.id && "opacity-40"
              )}
            >
              <div className="relative aspect-[4/3] bg-sand-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt={m.alt?.es || ""} loading="lazy" className="size-full object-cover" draggable={false} />
                <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2">
                  <span className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-extrabold text-navy shadow" title="Arrastra para reordenar">
                    <GripVertical className="size-3 cursor-grab" /> {idx + 1}
                  </span>
                  <div className="flex gap-1">
                    {m.is_cover && <span className="rounded-full bg-gold px-2 py-1 text-[10px] font-extrabold text-navy shadow">Portada</span>}
                    {m.kind === "floorplan" && <span className="rounded-full bg-navy px-2 py-1 text-[10px] font-extrabold text-white shadow">Plano</span>}
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 flex justify-between p-2">
                  <div className="flex gap-1">
                    <IconBtn label="Mover a la izquierda" onClick={() => move(m.id, -1)} disabled={idx === 0}>
                      <ChevronLeft className="size-3.5" />
                    </IconBtn>
                    <IconBtn label="Mover a la derecha" onClick={() => move(m.id, 1)} disabled={idx === items.length - 1}>
                      <ChevronRight className="size-3.5" />
                    </IconBtn>
                  </div>
                  <div className="flex gap-1">
                    {!m.is_cover && (
                      <IconBtn label="Marcar como portada" onClick={() => void setCover(m.id)}>
                        <Star className="size-3.5" />
                      </IconBtn>
                    )}
                    {allowFloorplan && (
                      <IconBtn
                        label={m.kind === "floorplan" ? "Marcar como imagen" : "Marcar como plano"}
                        onClick={() => void updateItem(m.id, { kind: m.kind === "floorplan" ? "image" : "floorplan" })}
                        active={m.kind === "floorplan"}
                      >
                        <Layers className="size-3.5" />
                      </IconBtn>
                    )}
                    <IconBtn label="Eliminar" onClick={() => void remove(m)} danger>
                      <Trash2 className="size-3.5" />
                    </IconBtn>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 p-2.5">
                {(["es", "en"] as const).map((lang) => (
                  <AltInput
                    key={lang}
                    lang={lang}
                    value={m.alt?.[lang] ?? ""}
                    onCommit={(v) => {
                      if (v === (m.alt?.[lang] ?? "")) return;
                      void updateItem(m.id, { alt: { es: m.alt?.es ?? "", en: m.alt?.en ?? "", [lang]: v } }, true);
                    }}
                  />
                ))}
                {m.width && m.height ? (
                  <p className="text-[10px] text-stone-light">
                    {m.width}×{m.height}px
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AltInput({ lang, value, onCommit }: { lang: "es" | "en"; value: string; onCommit: (v: string) => void }) {
  const [v, setV] = useState(value);
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-6 shrink-0 text-[9px] font-extrabold tracking-widest text-stone">{lang.toUpperCase()}</span>
      <input
        className="w-full rounded-lg border border-line px-2 py-1 text-xs focus:border-gold focus:outline-none"
        placeholder={lang === "es" ? "Texto alternativo" : "Alt text"}
        value={v}
        onChange={(e) => setV(e.target.value)}
        onBlur={() => onCommit(v.trim())}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
      />
    </div>
  );
}

function IconBtn({
  label,
  onClick,
  children,
  disabled,
  danger,
  active,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "grid size-7 place-items-center rounded-full bg-white/90 text-navy shadow transition-colors disabled:opacity-30",
        danger ? "hover:bg-red-600 hover:text-white" : "hover:bg-gold",
        active && "bg-navy text-white"
      )}
    >
      {children}
    </button>
  );
}
