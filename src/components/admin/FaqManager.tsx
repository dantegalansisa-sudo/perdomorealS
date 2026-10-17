"use client";
import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Plus, Trash2 } from "lucide-react";
import { deleteFaq, reorderFaqs, saveFaq, toggleFaqPublished } from "@/app/admin/_actions/faqs";
import type { Faq } from "@/lib/types";
import { cn } from "@/lib/utils";
import { I18nField, Toggle, type FieldErrors } from "./fields";
import { InlineToggle } from "./InlineActions";
import { PlaceholderPill } from "./ui";
import { useToast } from "./Toast";

type Project = { id: string; name: string };

export function FaqManager({ initial, projects }: { initial: Faq[]; projects: Project[] }) {
  const toast = useToast();
  const [faqs, setFaqs] = useState<Faq[]>(initial);
  const [scope, setScope] = useState<string>("all"); // all | global | project id
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [pending, start] = useTransition();
  const projectName = new Map(projects.map((p) => [p.id, p.name]));

  const inScope = (f: Faq) => (scope === "all" ? true : scope === "global" ? !f.project_id : f.project_id === scope);
  const sorted = [...faqs].sort((a, b) => (a.project_id ?? "").localeCompare(b.project_id ?? "") || a.sort - b.sort);
  const visible = sorted.filter(inScope);

  // Groups by scope so ordering happens within the same project/global list.
  const groups = new Map<string, Faq[]>();
  visible.forEach((f) => {
    const k = f.project_id ?? "global";
    groups.set(k, [...(groups.get(k) ?? []), f]);
  });

  function move(f: Faq, dir: -1 | 1) {
    const group = sorted.filter((x) => (x.project_id ?? null) === (f.project_id ?? null));
    const i = group.findIndex((x) => x.id === f.id);
    const j = i + dir;
    if (j < 0 || j >= group.length) return;
    const next = [...group];
    [next[i], next[j]] = [next[j], next[i]];
    const ids = next.map((x) => x.id);
    setFaqs((all) => all.map((x) => (ids.includes(x.id) ? { ...x, sort: ids.indexOf(x.id) } : x)));
    start(async () => {
      const res = await reorderFaqs(ids);
      if (!res.ok) toast.error(res.error);
    });
  }

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-center gap-3 p-4">
        <select className="field !w-auto min-w-[220px] !py-2 font-bold" value={scope} onChange={(e) => setScope(e.target.value)} aria-label="Filtrar">
          <option value="all">Todas las preguntas</option>
          <option value="global">Generales (sin proyecto)</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <span className="text-xs text-stone">{visible.length} preguntas</span>
        <button className="btn btn-gold btn-sm ml-auto" onClick={() => setCreating(true)}>
          <Plus className="size-4" /> Nueva pregunta
        </button>
      </div>

      {creating && (
        <FaqEditor
          faq={{ id: "", project_id: scope !== "all" && scope !== "global" ? scope : null, question: { es: "", en: "" }, answer: { es: "", en: "" }, sort: 0, published: true, is_placeholder: false }}
          projects={projects}
          onCancel={() => setCreating(false)}
          onSaved={(f) => {
            setFaqs((l) => [...l, f]);
            setCreating(false);
          }}
        />
      )}

      {visible.length === 0 && !creating && <p className="card px-4 py-10 text-center text-sm text-stone">No hay preguntas en este filtro.</p>}

      {[...groups.entries()].map(([key, list]) => (
        <div key={key} className="space-y-2">
          <h3 className="px-1 text-xs font-extrabold uppercase tracking-wider text-stone">{key === "global" ? "Generales" : projectName.get(key) ?? "Proyecto"}</h3>
          {list.map((f, idx) => (
            <div key={f.id} className={cn("card overflow-hidden p-0", openId === f.id && "border-gold")}>
              <div className="flex items-center gap-2 px-3 py-2.5 sm:px-4">
                <div className="flex flex-col">
                  <button disabled={idx === 0 || pending} onClick={() => move(f, -1)} className="text-stone hover:text-navy disabled:opacity-25" aria-label="Subir">
                    <ArrowUp className="size-3.5" />
                  </button>
                  <button disabled={idx === list.length - 1 || pending} onClick={() => move(f, 1)} className="text-stone hover:text-navy disabled:opacity-25" aria-label="Bajar">
                    <ArrowDown className="size-3.5" />
                  </button>
                </div>
                <button onClick={() => setOpenId(openId === f.id ? null : f.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                  <span className="truncate text-sm font-bold text-navy">{f.question.es || f.question.en}</span>
                  {f.is_placeholder && <PlaceholderPill />}
                  <ChevronDown className={cn("ml-auto size-4 shrink-0 text-stone transition-transform", openId === f.id && "rotate-180")} />
                </button>
                <InlineToggle
                  initial={f.published}
                  action={async (v) => {
                    const r = await toggleFaqPublished(f.id, v);
                    if (r.ok) setFaqs((l) => l.map((x) => (x.id === f.id ? { ...x, published: v } : x)));
                    return r;
                  }}
                  label="Publicada"
                />
              </div>
              {openId === f.id && (
                <div className="border-t border-line">
                  <FaqEditor
                    faq={f}
                    projects={projects}
                    embedded
                    onCancel={() => setOpenId(null)}
                    onSaved={(saved) => {
                      setFaqs((l) => l.map((x) => (x.id === saved.id ? saved : x)));
                      setOpenId(null);
                    }}
                    onDeleted={() => setFaqs((l) => l.filter((x) => x.id !== f.id))}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function FaqEditor({
  faq,
  projects,
  embedded,
  onCancel,
  onSaved,
  onDeleted,
}: {
  faq: Faq;
  projects: Project[];
  embedded?: boolean;
  onCancel: () => void;
  onSaved: (f: Faq) => void;
  onDeleted?: () => void;
}) {
  const toast = useToast();
  const [form, setForm] = useState(faq);
  const [errors, setErrors] = useState<FieldErrors>();
  const [pending, start] = useTransition();

  function save() {
    start(async () => {
      const res = await saveFaq(faq.id || null, {
        project_id: form.project_id,
        question: form.question,
        answer: form.answer,
        published: form.published,
        is_placeholder: form.is_placeholder,
      });
      setErrors(res.ok ? undefined : res.fieldErrors);
      toast.result(res);
      if (res.ok && res.data) onSaved(res.data);
    });
  }

  function remove() {
    if (!confirm("¿Eliminar esta pregunta?")) return;
    start(async () => {
      const res = await deleteFaq(faq.id);
      if (toast.result(res)) onDeleted?.();
    });
  }

  return (
    <div className={cn("space-y-4 p-4", !embedded && "card border-gold")}>
      <div>
        <label className="label">Proyecto</label>
        <select className="field" value={form.project_id ?? ""} onChange={(e) => setForm({ ...form, project_id: e.target.value || null })}>
          <option value="">General (todas las páginas)</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <I18nField label="Pregunta" required value={form.question} onChange={(v) => setForm({ ...form, question: v })} error={errors?.["question.es"]} />
      <I18nField label="Respuesta" required value={form.answer} onChange={(v) => setForm({ ...form, answer: v })} error={errors?.["answer.es"]} multiline rows={4} />
      <div className="flex flex-wrap gap-6">
        <Toggle checked={form.published} onChange={(v) => setForm({ ...form, published: v })} label="Publicada" />
        <Toggle checked={form.is_placeholder} onChange={(v) => setForm({ ...form, is_placeholder: v })} label="Información de ejemplo" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4">
        {faq.id ? (
          <button type="button" onClick={remove} disabled={pending} className="btn btn-sm text-red-600 hover:bg-red-50">
            <Trash2 className="size-4" /> Eliminar
          </button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="btn btn-ghost btn-sm">
            Cancelar
          </button>
          <button type="button" onClick={save} disabled={pending} className="btn btn-navy btn-sm disabled:opacity-60">
            {pending ? "Guardando…" : faq.id ? "Guardar" : "Crear pregunta"}
          </button>
        </div>
      </div>
    </div>
  );
}
