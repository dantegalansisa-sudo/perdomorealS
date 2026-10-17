"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { submitLead } from "@/app/actions/leads";
import { useSite } from "@/components/providers/SiteProvider";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type FormType = "info" | "price" | "visit";

const TIMES = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];
const BUDGETS = ["<150k", "150k-300k", "300k-500k", "500k-1M", ">1M"];

declare global {
  interface Window {
    turnstile?: { render: (el: HTMLElement, opts: Record<string, unknown>) => string; reset: (id?: string) => void };
  }
}

function useUtm() {
  const [utm, setUtm] = useState<Record<string, string> | undefined>();
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const found: Record<string, string> = {};
      ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"].forEach((k) => {
        const v = params.get(k);
        if (v) found[k] = v.slice(0, 200);
      });
      if (Object.keys(found).length) sessionStorage.setItem("pre:utm", JSON.stringify(found));
      const stored = sessionStorage.getItem("pre:utm");
      if (stored) setUtm(JSON.parse(stored));
    } catch {}
  }, []);
  return utm;
}

export function LeadForm({
  type: initialType = "info",
  projectId,
  propertyId,
  interest,
  allowTypeSwitch = true,
  className,
  onDone,
  dark = false,
}: {
  type?: FormType;
  projectId?: string | null;
  propertyId?: string | null;
  interest?: string | null;
  allowTypeSwitch?: boolean;
  className?: string;
  onDone?: () => void;
  dark?: boolean;
}) {
  const t = useTranslations("forms");
  const locale = useLocale() as "es" | "en";
  const { projects } = useSite();
  const utm = useUtm();
  const id = useId();
  const [type, setType] = useState<FormType>(initialType);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [status, setStatus] = useState<"idle" | "ok" | "error" | "rate_limit">("idle");
  const [pending, startTransition] = useTransition();
  const [project, setProject] = useState(projectId ?? "");
  const turnstileRef = useRef<HTMLDivElement>(null);
  const [turnstileToken, setTurnstileToken] = useState<string>();
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => setType(initialType), [initialType]);
  useEffect(() => setProject(projectId ?? ""), [projectId]);

  useEffect(() => {
    if (!siteKey || !turnstileRef.current) return;
    const el = turnstileRef.current;
    const render = () => window.turnstile?.render(el, { sitekey: siteKey, callback: (tok: string) => setTurnstileToken(tok) });
    if (window.turnstile) return void render();
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    s.async = true;
    s.onload = render;
    document.head.appendChild(s);
  }, [siteKey]);

  const today = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => (fd.get(k) as string | null) ?? "";
    const projectName = projects.find((p) => p.id === project)?.name;
    startTransition(async () => {
      const res = await submitLead({
        type,
        name: get("name"),
        email: get("email"),
        phone: get("phone"),
        projectId: project || null,
        propertyId: propertyId ?? null,
        interest: interest ?? projectName ?? null,
        budget: get("budget"),
        message: get("message"),
        locale,
        visitDate: get("visitDate"),
        visitTime: get("visitTime"),
        visitMode: type === "visit" ? ((get("visitMode") || "presencial") as "presencial" | "virtual") : undefined,
        sourceUrl: window.location.href,
        utm,
        turnstileToken,
        website: get("website"),
        consent: fd.get("consent") === "on" ? true : (false as unknown as true),
      });
      if (res.ok) {
        setStatus("ok");
        setErrors({});
        track("form_submit_success", { lead_type: type, project: projectName ?? interest ?? undefined });
        if (type === "price") track("price_request", { project: projectName ?? interest ?? undefined });
        if (type === "visit") track("visit_request", { project: projectName ?? interest ?? undefined });
        onDone?.();
      } else {
        setErrors(res.fieldErrors ?? {});
        setStatus(res.error === "rate_limit" ? "rate_limit" : res.error === "validation" ? "idle" : "error");
      }
    });
  }

  if (status === "ok") {
    return (
      <div className={cn("flex flex-col items-center gap-3 rounded-3xl p-8 text-center", dark ? "bg-white/5 text-white" : "bg-white", className)} role="status" aria-live="polite">
        <CheckCircle2 className="size-12 text-gold" aria-hidden />
        <p className="font-display text-3xl">{t("successTitle")}</p>
        <p className={cn("max-w-sm text-sm", dark ? "text-white/70" : "text-stone")}>{type === "visit" ? t("successVisit") : t("successText")}</p>
        <button type="button" className="btn btn-ghost btn-sm mt-2" onClick={() => setStatus("idle")}>
          {t("sendAnother")}
        </button>
      </div>
    );
  }

  const err = (k: string) => (errors[k]?.length ? t(`errors.${k}` as never) : null);
  const fieldCls = (k: string) => cn("field", errors[k] && "border-sold");
  const labelCls = cn("label", dark && "text-white/80");

  return (
    <form onSubmit={onSubmit} noValidate className={cn("grid gap-4", className)} aria-describedby={`${id}-status`}>
      {allowTypeSwitch && (
        <div role="radiogroup" aria-label={t("requestType")} className="flex flex-wrap gap-2">
          {(["info", "price", "visit"] as FormType[]).map((k) => (
            <button key={k} type="button" role="radio" aria-checked={type === k} data-active={type === k} onClick={() => setType(k)} className="chip">
              {t(`types.${k}`)}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor={`${id}-name`} className={labelCls}>
            {t("name")} *
          </label>
          <input id={`${id}-name`} name="name" autoComplete="name" required className={fieldCls("name")} aria-invalid={!!errors.name} />
          {err("name") && <p className="mt-1 text-xs text-sold-ink">{err("name")}</p>}
        </div>
        <div>
          <label htmlFor={`${id}-email`} className={labelCls}>
            {t("email")} *
          </label>
          <input id={`${id}-email`} name="email" type="email" autoComplete="email" required className={fieldCls("email")} aria-invalid={!!errors.email} />
          {err("email") && <p className="mt-1 text-xs text-sold-ink">{err("email")}</p>}
        </div>
        <div>
          <label htmlFor={`${id}-phone`} className={labelCls}>
            {t("phone")} *
          </label>
          <input id={`${id}-phone`} name="phone" type="tel" autoComplete="tel" required placeholder="+1 809 000 0000" className={fieldCls("phone")} aria-invalid={!!errors.phone} />
          {err("phone") && <p className="mt-1 text-xs text-sold-ink">{err("phone")}</p>}
        </div>
        <div>
          <label htmlFor={`${id}-project`} className={labelCls}>
            {t("project")}
          </label>
          <select id={`${id}-project`} value={project} onChange={(e) => setProject(e.target.value)} className="field">
            <option value="">{t("projectAny")}</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${id}-budget`} className={labelCls}>
            {t("budget")}
          </label>
          <select id={`${id}-budget`} name="budget" className="field" defaultValue="">
            <option value="">{t("budgetAny")}</option>
            {BUDGETS.map((b) => (
              <option key={b} value={b}>
                {t(`budgets.${b}` as never)}
              </option>
            ))}
          </select>
        </div>

        {type === "visit" && (
          <>
            <div>
              <label htmlFor={`${id}-date`} className={labelCls}>
                {t("visitDate")} *
              </label>
              <input id={`${id}-date`} name="visitDate" type="date" min={today} required className={fieldCls("visitDate")} />
              {err("visitDate") && <p className="mt-1 text-xs text-sold-ink">{err("visitDate")}</p>}
            </div>
            <div>
              <label htmlFor={`${id}-time`} className={labelCls}>
                {t("visitTime")} *
              </label>
              <select id={`${id}-time`} name="visitTime" required className="field" defaultValue="10:00">
                {TIMES.map((tm) => (
                  <option key={tm}>{tm}</option>
                ))}
              </select>
            </div>
            <fieldset className="sm:col-span-2">
              <legend className={labelCls}>{t("visitMode")}</legend>
              <div className="flex gap-2">
                {(["presencial", "virtual"] as const).map((m) => (
                  <label key={m} className="chip cursor-pointer has-[:checked]:border-gold has-[:checked]:bg-gold-soft">
                    <input type="radio" name="visitMode" value={m} defaultChecked={m === "presencial"} className="sr-only" />
                    {t(`modes.${m}`)}
                  </label>
                ))}
              </div>
            </fieldset>
          </>
        )}

        <div className="sm:col-span-2">
          <label htmlFor={`${id}-message`} className={labelCls}>
            {t("message")}
          </label>
          <textarea id={`${id}-message`} name="message" rows={3} className="field resize-none" placeholder={t("messagePlaceholder")} />
        </div>
      </div>

      {/* Honeypot — hidden from humans and assistive tech */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label className={cn("flex items-start gap-2 text-xs", dark ? "text-white/70" : "text-stone")}>
        <input type="checkbox" name="consent" required className="mt-0.5 size-4 accent-[#C9A961]" />
        <span>{t("consent")}</span>
      </label>
      {err("consent") && <p className="-mt-2 text-xs text-sold-ink">{err("consent")}</p>}

      {siteKey && <div ref={turnstileRef} />}

      <button type="submit" disabled={pending} className="btn btn-gold w-full sm:w-auto">
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Send className="size-4" aria-hidden />}
        {type === "price" ? t("submitPrice") : type === "visit" ? t("submitVisit") : t("submit")}
      </button>

      <p id={`${id}-status`} aria-live="polite" className="text-sm text-sold-ink">
        {status === "error" && t("errorGeneric")}
        {status === "rate_limit" && t("errorRateLimit")}
      </p>
    </form>
  );
}
