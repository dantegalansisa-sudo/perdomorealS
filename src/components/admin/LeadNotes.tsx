"use client";
import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { addLeadNote, deleteLeadNote } from "@/app/admin/_actions/leads";
import type { LeadNote } from "@/lib/types";
import { useToast } from "./Toast";

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("es-DO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function LeadNotes({ leadId, initial }: { leadId: string; initial: LeadNote[] }) {
  const toast = useToast();
  const [notes, setNotes] = useState<LeadNote[]>(initial);
  const [body, setBody] = useState("");
  const [pending, start] = useTransition();

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    start(async () => {
      const res = await addLeadNote(leadId, body);
      toast.result(res);
      if (res.ok && res.data) {
        setNotes((n) => [res.data!, ...n]);
        setBody("");
      }
    });
  }

  function remove(id: string) {
    if (!confirm("¿Eliminar esta nota?")) return;
    start(async () => {
      const res = await deleteLeadNote(id);
      if (toast.result(res)) setNotes((n) => n.filter((x) => x.id !== id));
    });
  }

  return (
    <div>
      <form onSubmit={add} className="space-y-2">
        <textarea
          className="field resize-y"
          rows={3}
          placeholder="Escribe una nota interna (llamada, acuerdo, próximo paso…)"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) add(e);
          }}
        />
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-stone">Ctrl + Enter para guardar</span>
          <button className="btn btn-navy btn-sm disabled:opacity-60" disabled={pending || !body.trim()}>
            {pending && <Loader2 className="size-4 animate-spin" />} Añadir nota
          </button>
        </div>
      </form>
      <ul className="mt-5 space-y-3">
        {notes.length === 0 && <li className="text-sm text-stone">Sin notas todavía.</li>}
        {notes.map((n) => (
          <li key={n.id} className="group rounded-2xl border border-line bg-sand/50 p-3">
            <div className="mb-1 flex items-center justify-between gap-2 text-[11px] text-stone">
              <span className="font-bold text-navy-soft">{n.author || "—"}</span>
              <span className="flex items-center gap-2">
                {fmt(n.created_at)}
                <button onClick={() => remove(n.id)} className="opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100" aria-label="Eliminar nota">
                  <Trash2 className="size-3.5" />
                </button>
              </span>
            </div>
            <p className="whitespace-pre-wrap text-sm text-navy">{n.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
