"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import type { ActionResult } from "@/lib/admin/result";
import { cn } from "@/lib/utils";
import { useToast } from "./Toast";

/** Compact switch bound to a server action (e.g. toggleProjectFlag.bind(null, id, "published")). */
export function InlineToggle({
  initial,
  action,
  label,
}: {
  initial: boolean;
  action: (value: boolean) => Promise<ActionResult>;
  label: string;
}) {
  const toast = useToast();
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={label}
      title={label}
      disabled={pending}
      onClick={() => {
        const next = !value;
        setValue(next);
        start(async () => {
          const res = await action(next);
          if (!toast.result(res)) setValue(!next);
          else router.refresh();
        });
      }}
      className={cn("relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:opacity-60", value ? "bg-gold" : "bg-sand-3")}
    >
      <span className={cn("inline-block size-4 rounded-full bg-white shadow transition-transform", value ? "translate-x-4.5" : "translate-x-0.5")} />
    </button>
  );
}

/** Danger button that confirms, then runs a (bound) server action. */
export function ConfirmActionButton({
  action,
  confirmText,
  label = "Eliminar",
  className,
  successMessage,
  redirectTo,
}: {
  action: () => Promise<ActionResult | void>;
  confirmText: string;
  label?: string;
  className?: string;
  successMessage?: string;
  redirectTo?: string;
}) {
  const toast = useToast();
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(confirmText)) return;
        start(async () => {
          const res = await action();
          if (res && !toast.result(res, successMessage)) return;
          if (redirectTo) router.push(redirectTo);
          else router.refresh();
        });
      }}
      className={cn("btn btn-sm border border-red-200 bg-white text-red-600 hover:bg-red-50 disabled:opacity-60", className)}
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />} {label}
    </button>
  );
}
