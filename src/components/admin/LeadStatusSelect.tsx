"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateLeadStatus } from "@/app/admin/_actions/leads";
import { LEAD_STATUS, LEAD_STATUS_STYLE } from "@/lib/admin/constants";
import type { LeadStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useToast } from "./Toast";

const ORDER: LeadStatus[] = ["new", "contacted", "visit", "negotiation", "closed", "lost"];

export function LeadStatusSelect({ id, initial, size = "sm" }: { id: string; initial: LeadStatus; size?: "sm" | "lg" }) {
  const toast = useToast();
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [pending, start] = useTransition();
  return (
    <select
      value={value}
      disabled={pending}
      aria-label="Estado del lead"
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => {
        const next = e.target.value as LeadStatus;
        const prev = value;
        setValue(next);
        start(async () => {
          const res = await updateLeadStatus(id, next);
          if (!toast.result(res)) setValue(prev);
          else router.refresh();
        });
      }}
      className={cn(
        "cursor-pointer rounded-full border font-extrabold focus:outline-none disabled:opacity-60",
        size === "sm" ? "px-2.5 py-1 text-xs" : "px-4 py-2 text-sm",
        LEAD_STATUS_STYLE[value]
      )}
    >
      {ORDER.map((s) => (
        <option key={s} value={s}>
          {LEAD_STATUS[s]}
        </option>
      ))}
    </select>
  );
}

/** Visual pipeline: Nuevo → Contactado → Visita → Negociación → Cerrado / Perdido. */
export function LeadPipeline({ id, initial }: { id: string; initial: LeadStatus }) {
  const toast = useToast();
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [pending, start] = useTransition();
  const main: LeadStatus[] = ["new", "contacted", "visit", "negotiation", "closed"];
  const idx = main.indexOf(value);

  function set(next: LeadStatus) {
    if (next === value) return;
    const prev = value;
    setValue(next);
    start(async () => {
      const res = await updateLeadStatus(id, next);
      if (!toast.result(res)) setValue(prev);
      else router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ol className="flex flex-1 flex-wrap gap-1">
        {main.map((s, i) => (
          <li key={s} className="flex-1">
            <button
              type="button"
              disabled={pending}
              onClick={() => set(s)}
              className={cn(
                "w-full min-w-[84px] rounded-lg px-2 py-2 text-xs font-extrabold transition-colors disabled:opacity-70",
                value === "lost"
                  ? "bg-sand-2 text-stone"
                  : i < idx
                    ? "bg-navy/80 text-white"
                    : i === idx
                      ? "bg-gold text-navy"
                      : "bg-sand-2 text-stone hover:bg-sand-3"
              )}
            >
              {LEAD_STATUS[s]}
            </button>
          </li>
        ))}
      </ol>
      <button
        type="button"
        disabled={pending}
        onClick={() => set(value === "lost" ? "new" : "lost")}
        className={cn("rounded-lg border px-3 py-2 text-xs font-extrabold", value === "lost" ? "border-stone bg-stone text-white" : "border-line text-stone hover:border-stone")}
      >
        {value === "lost" ? "Perdido ✕ (reabrir)" : "Marcar perdido"}
      </button>
    </div>
  );
}
