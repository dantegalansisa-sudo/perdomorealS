"use client";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export const MEDIA_BUCKET = "media";

export type CompressedImage = { blob: Blob; width: number; height: number; ext: string; type: string };

/**
 * Resizes (max `maxEdge` px on the long edge) and converts an image to WebP using a canvas.
 * Falls back to JPEG when the browser can't encode WebP.
 */
export async function compressImage(file: File, maxEdge = 2400, quality = 0.82): Promise<CompressedImage> {
  let source: ImageBitmap | HTMLImageElement;
  try {
    source = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    source = await loadImage(file);
  }
  const srcW = source.width;
  const srcH = source.height;
  const scale = Math.min(1, maxEdge / Math.max(srcW, srcH));
  const width = Math.max(1, Math.round(srcW * scale));
  const height = Math.max(1, Math.round(srcH * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Tu navegador no permite procesar imágenes.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, width, height);
  if ("close" in source) source.close();

  const toBlob = (type: string) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), type, quality));
  let blob = await toBlob("image/webp");
  if (!blob || blob.type !== "image/webp") {
    blob = await toBlob("image/jpeg");
    if (!blob) throw new Error("No se pudo comprimir la imagen.");
    return { blob, width, height, ext: "jpg", type: "image/jpeg" };
  }
  return { blob, width, height, ext: "webp", type: "image/webp" };
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Formato de imagen no soportado."));
    };
    img.src = url;
  });
}

export function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Uploads a blob to Supabase Storage with real progress (XHR against the Storage REST API),
 * authenticated as the logged-in staff user. Returns the public URL.
 */
export async function uploadToStorage(
  path: string,
  blob: Blob,
  contentType: string,
  onProgress?: (pct: number) => void
): Promise<{ path: string; publicUrl: string }> {
  const supabase = createBrowserSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Tu sesión expiró. Vuelve a iniciar sesión.");
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/$/, "");
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${base}/storage/v1/object/${MEDIA_BUCKET}/${encoded}`);
    xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);
    xhr.setRequestHeader("apikey", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.setRequestHeader("cache-control", "max-age=31536000");
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else {
        let msg = `Error al subir (${xhr.status})`;
        try {
          const body = JSON.parse(xhr.responseText) as { message?: string; error?: string };
          if (body.message) msg = body.message;
        } catch {}
        if (xhr.status === 403 || /row-level security/i.test(msg)) msg = "No tienes permisos para subir archivos.";
        reject(new Error(msg));
      }
    };
    xhr.onerror = () => reject(new Error("Error de red al subir el archivo."));
    xhr.send(blob);
  });
  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}

/** Extracts the storage object path from a public URL of the media bucket (or null). */
export function storagePathFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${MEDIA_BUCKET}/`;
  const i = url.indexOf(marker);
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length));
}
