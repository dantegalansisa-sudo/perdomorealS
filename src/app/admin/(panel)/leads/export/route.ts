import { NextResponse, type NextRequest } from "next/server";
import { hasSupabase } from "@/lib/env";
import { getAdminContext } from "@/lib/admin/auth";
import { parseLeadFilters, queryLeads } from "@/lib/admin/leads";
import { LEAD_STATUS, LEAD_TYPES } from "@/lib/admin/constants";

export const dynamic = "force-dynamic";

function csvCell(v: unknown) {
  if (v === null || v === undefined) return "";
  let s = typeof v === "object" ? JSON.stringify(v) : String(v);
  // Neutralize spreadsheet formula injection.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",;\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Staff-only CSV export of the leads matching the current filters. */
export async function GET(req: NextRequest) {
  if (!hasSupabase) return new NextResponse("Supabase no configurado", { status: 503 });
  const ctx = await getAdminContext();
  if (!ctx?.profile) return new NextResponse("No autorizado", { status: 401 });

  const filters = parseLeadFilters(Object.fromEntries(req.nextUrl.searchParams.entries()));
  const { rows, error } = await queryLeads(ctx.supabase, filters, 10000);
  if (error) return new NextResponse(`Error: ${error.message}`, { status: 500 });

  const headers = [
    "Fecha",
    "Estado",
    "Tipo",
    "Nombre",
    "Email",
    "Teléfono",
    "Proyecto",
    "Propiedad",
    "Interés",
    "Presupuesto",
    "Mensaje",
    "Idioma",
    "Fecha visita",
    "Hora visita",
    "Modalidad visita",
    "URL origen",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "ID",
  ];
  const lines = rows.map((l) =>
    [
      new Date(l.created_at).toLocaleString("sv-SE", { timeZone: "America/Santo_Domingo" }),
      LEAD_STATUS[l.status] ?? l.status,
      LEAD_TYPES[l.type] ?? l.type,
      l.name,
      l.email,
      l.phone,
      l.project?.name,
      l.property?.title?.es,
      l.interest,
      l.budget,
      l.message,
      l.locale,
      l.visit_date,
      l.visit_time,
      l.visit_mode,
      l.source_url,
      l.utm?.utm_source ?? l.utm?.source,
      l.utm?.utm_medium ?? l.utm?.medium,
      l.utm?.utm_campaign ?? l.utm?.campaign,
      l.utm?.utm_term ?? l.utm?.term,
      l.utm?.utm_content ?? l.utm?.content,
      l.id,
    ]
      .map(csvCell)
      .join(",")
  );
  const csv = "﻿" + [headers.join(","), ...lines].join("\r\n");
  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-perdomo-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
