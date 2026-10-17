"use client";
import { useRef, useState } from "react";
import { FileText, ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { compressImage, uploadToStorage, uuid } from "@/lib/admin/upload";
import { cn } from "@/lib/utils";
import { useToast } from "./Toast";

/**
 * URL field + "upload PDF" button. Uploads to `media/{folder}/{uuid}.pdf` and sets the public URL.
 */
export function PdfUrlField({
  value,
  onChange,
  folder,
  placeholder = "https://… o sube un PDF",
  className,
}: {
  value: string | null | undefined;
  onChange: (url: string) => void;
  folder: string;
  placeholder?: string;
  className?: string;
}) {
  const toast = useToast();
  const ref = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);

  async function upload(file: File) {
    if (file.type !== "application/pdf") return toast.error("El archivo debe ser un PDF.");
    if (file.size > 30 * 1024 * 1024) return toast.error("El PDF supera 30 MB.");
    setProgress(0);
    try {
      const base = file.name.replace(/\.pdf$/i, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50) || "documento";
      const { publicUrl } = await uploadToStorage(`${folder}/${uuid().slice(0, 8)}-${base}.pdf`, file, "application/pdf", setProgress);
      onChange(publicUrl);
      toast.success("PDF subido. Recuerda guardar los cambios.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo subir el PDF.");
    }
    setProgress(null);
  }

  return (
    <div className={cn("flex gap-2", className)}>
      <div className="relative min-w-0 flex-1">
        <FileText className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone" />
        <input className="field pl-10 text-sm" value={value ?? ""} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      </div>
      <button type="button" className="btn btn-ghost btn-sm shrink-0" onClick={() => ref.current?.click()} disabled={progress !== null}>
        {progress !== null ? (
          <>
            <Loader2 className="size-4 animate-spin" /> {progress}%
          </>
        ) : (
          <>
            <Upload className="size-4" /> <span className="hidden sm:inline">PDF</span>
          </>
        )}
      </button>
      {value && (
        <a href={value} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm shrink-0 !px-3" title="Abrir">
          <FileText className="size-4" />
        </a>
      )}
      <input
        ref={ref}
        type="file"
        accept="application/pdf"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void upload(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

/** Single image upload (compressed to WebP) storing its public URL — used for blog covers. */
export function ImageUrlField({ value, onChange, folder }: { value: string | null | undefined; onChange: (url: string) => void; folder: string }) {
  const toast = useToast();
  const ref = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);

  async function upload(file: File) {
    if (!file.type.startsWith("image/")) return toast.error("El archivo debe ser una imagen.");
    setProgress(0);
    try {
      const img = await compressImage(file);
      const { publicUrl } = await uploadToStorage(`${folder}/${uuid()}.${img.ext}`, img.blob, img.type, setProgress);
      onChange(publicUrl);
      toast.success("Imagen subida. Recuerda guardar los cambios.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo subir la imagen.");
    }
    setProgress(null);
  }

  return (
    <div className="space-y-2">
      <div
        onClick={() => ref.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) void upload(f);
        }}
        className={cn(
          "relative grid aspect-[16/9] cursor-pointer place-items-center overflow-hidden rounded-2xl border-2 border-dashed bg-sand/60 transition-colors",
          dragOver ? "border-gold bg-gold-soft/40" : "border-line hover:border-gold/60"
        )}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="absolute inset-0 size-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1 text-center">
            <ImagePlus className="size-6 text-gold-dark" />
            <p className="text-sm font-bold">Subir imagen de portada</p>
            <p className="text-xs text-stone">Arrastra o haz clic · se convierte a WebP</p>
          </div>
        )}
        {progress !== null && (
          <div className="absolute inset-0 grid place-items-center bg-white/80 text-sm font-bold">
            <span className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" /> {progress}%
            </span>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <input className="field text-sm" placeholder="https://…" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
        {value && (
          <button type="button" className="btn btn-ghost btn-sm shrink-0 !px-3" title="Quitar imagen" onClick={() => onChange("")}>
            <Trash2 className="size-4" />
          </button>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void upload(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
