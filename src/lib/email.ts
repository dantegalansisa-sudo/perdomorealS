import "server-only";
import { Resend } from "resend";

type LeadRow = {
  type: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  interest: string | null;
  budget: string | null;
  message: string | null;
  locale: string;
  visit_date: string | null;
  visit_time: string | null;
  visit_mode: string | null;
  source_url: string | null;
};

const TYPE_LABEL: Record<string, string> = {
  info: "Solicitud de información",
  price: "Solicitud de precios",
  visit: "Agendar visita",
};

const esc = (s: string | null | undefined) =>
  (s ?? "—").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Notifies the sales inbox of a new lead. No-op when Resend isn't configured. */
export async function sendLeadNotification(lead: LeadRow) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.LEADS_NOTIFY_TO;
  if (!key || !to) return;
  const resend = new Resend(key);
  const rows: [string, string | null][] = [
    ["Tipo", TYPE_LABEL[lead.type] ?? lead.type],
    ["Nombre", lead.name],
    ["Email", lead.email],
    ["Teléfono / WhatsApp", lead.phone],
    ["Interés", lead.interest],
    ["Presupuesto", lead.budget],
    ["Idioma", lead.locale.toUpperCase()],
    ...(lead.type === "visit"
      ? ([
          ["Fecha de visita", lead.visit_date],
          ["Hora", lead.visit_time],
          ["Modalidad", lead.visit_mode],
        ] as [string, string | null][])
      : []),
    ["Mensaje", lead.message],
    ["Página", lead.source_url],
  ];
  const html = `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#0B1F3A">
    <h2 style="margin:0 0 4px">Nuevo lead — ${esc(TYPE_LABEL[lead.type] ?? lead.type)}</h2>
    <p style="color:#7B7468;margin:0 0 16px">Perdomo Real Estate</p>
    <table style="width:100%;border-collapse:collapse">
      ${rows
        .map(
          ([k, v]) =>
            `<tr><td style="padding:8px;border-bottom:1px solid #E6E0D4;color:#7B7468;width:40%">${esc(k)}</td><td style="padding:8px;border-bottom:1px solid #E6E0D4">${esc(v)}</td></tr>`
        )
        .join("")}
    </table>
  </div>`;
  await resend.emails.send({
    from: process.env.LEADS_NOTIFY_FROM || "Perdomo Real Estate <onboarding@resend.dev>",
    to: to.split(",").map((s) => s.trim()),
    replyTo: lead.email ?? undefined,
    subject: `Nuevo lead: ${TYPE_LABEL[lead.type] ?? lead.type} — ${lead.name ?? ""}${lead.interest ? ` (${lead.interest})` : ""}`,
    html,
  });
}
