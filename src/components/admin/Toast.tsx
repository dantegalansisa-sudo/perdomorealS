"use client";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastKind = "success" | "error" | "info";
type ToastItem = { id: number; kind: ToastKind; message: string };
type ToastApi = {
  success: (m: string) => void;
  error: (m: string) => void;
  info: (m: string) => void;
  /** Shows success/error from an ActionResult-like object. Returns `ok`. */
  result: (r: { ok: boolean; error?: string; message?: string }, successMsg?: string) => boolean;
};

const ToastContext = createContext<ToastApi | null>(null);

let counter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => setItems((l) => l.filter((t) => t.id !== id)), []);
  const push = useCallback(
    (kind: ToastKind, message: string) => {
      const id = ++counter;
      setItems((l) => [...l.slice(-3), { id, kind, message }]);
      setTimeout(() => dismiss(id), kind === "error" ? 7000 : 3500);
    },
    [dismiss]
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (m) => push("success", m),
      error: (m) => push("error", m),
      info: (m) => push("info", m),
      result: (r, successMsg = "Cambios guardados") => {
        if (r.ok) push("success", r.message || successMsg);
        else push("error", r.error || "No se pudo completar la acción");
        return r.ok;
      },
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-20 z-[100] flex flex-col items-center gap-2 px-4 lg:bottom-6 lg:items-end lg:pr-6"
      >
        <AnimatePresence initial={false}>
          {items.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.22 }}
              className={cn(
                "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border bg-white px-4 py-3 text-sm shadow-xl shadow-navy/10",
                t.kind === "success" && "border-emerald-200",
                t.kind === "error" && "border-red-200",
                t.kind === "info" && "border-line"
              )}
              role={t.kind === "error" ? "alert" : "status"}
            >
              {t.kind === "success" && <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />}
              {t.kind === "error" && <XCircle className="mt-0.5 size-4 shrink-0 text-red-600" />}
              {t.kind === "info" && <Info className="mt-0.5 size-4 shrink-0 text-gold-dark" />}
              <p className="flex-1 font-medium text-navy">{t.message}</p>
              <button onClick={() => dismiss(t.id)} className="text-stone hover:text-navy" aria-label="Cerrar">
                <X className="size-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
