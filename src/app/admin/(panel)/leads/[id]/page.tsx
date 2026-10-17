import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Calendar, ExternalLink, Mail, MessageCircle, Phone } from "lucide-react";
import { requireStaff } from "@/lib/admin/auth";
import { deleteLead } from "@/app/admin/_actions/leads";
import { LEAD_TYPES } from "@/lib/admin/constants";
import type { LeadRow } from "@/lib/admin/leads";
import { Card, PageHeader, Pill } from "@/components/admin/ui";
import { LeadPipeline } from "@/components/admin/LeadStatusSelect";
import { LeadNotes } from "@/components/admin/LeadNotes";
import { ConfirmActionButton } from "@/components/admin/InlineActions";
import type { LeadNote } from "@/lib/types";

export const metadata: Metadata = { title: "Lead" };

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 border-b border-line py-2.5 text-sm last:border-0">
      <dt className="font-semibold text-stone">{label}</dt>
      <dd className="min-w-0 break-words text-navy">{children || <span className="text-stone-light">—</span>}</dd>
    </div>
  );
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase, profile } = await requireStaff();
  const [{ data }, { data: notes }] = await Promise.all([
    supabase.from("leads").select("*, project:projects(name), property:properties(title,slug_es)").eq("id", id).maybeSingle(),
    supabase.from("lead_notes").select("*").eq("lead_id", id).order("created_at", { ascending: false }),
  ]);
  if (!data) notFound();
  const lead = data as unknown as LeadRow & { property: { title: { es: string; en: string }; slug_es: string } | null };
  const phone = lead.phone?.replace(/\D/g, "") ?? "";
  const first = lead.name?.split(" ")[0] ?? "";
  const waText =
    lead.locale === "en"
      ? `Hi ${first}, this is Perdomo Real Estate. Thanks for your interest${lead.project?.name ? ` in ${lead.project.name}` : ""}.`
      : `Hola ${first}, te escribe Perdomo Real Estate. Gracias por tu interés${lead.project?.name ? ` en ${lead.project.name}` : ""}.`;
  const created = new Date(lead.created_at).toLocaleString("es-DO", { timeZone: "America/Santo_Domingo", dateStyle: "full", timeStyle: "short" });
  const utm = lead.utm && typeof lead.utm === "object" ? Object.entries(lead.utm).filter(([, v]) => v) : [];

  return (
    <>
      <PageHeader
        title={lead.name || "Lead sin nombre"}
        back={{ href: "/admin/leads", label: "Leads" }}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <Pill className="border-line bg-white text-navy-soft">{LEAD_TYPES[lead.type]}</Pill>
            <span>{created}</span>
          </span>
        }
        actions={
          <>
            {phone && (
              <a href={`https://wa.me/${phone}?text=${encodeURIComponent(waText)}`} target="_blank" rel="noreferrer" className="btn btn-sm bg-whatsapp text-white hover:brightness-95">
                <MessageCircle className="size-4" /> WhatsApp
              </a>
            )}
            {lead.email && (
              <a href={`mailto:${lead.email}?subject=${encodeURIComponent("Perdomo Real Estate")}`} className="btn btn-navy btn-sm">
                <Mail className="size-4" /> Email
              </a>
            )}
            {phone && (
              <a href={`tel:+${phone}`} className="btn btn-ghost btn-sm">
                <Phone className="size-4" /> Llamar
              </a>
            )}
          </>
        }
      />

      <Card className="mb-4">
        <p className="label">Etapa del proceso</p>
        <LeadPipeline id={lead.id} initial={lead.status} />
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <Card>
            <h2 className="mb-2 font-sans text-base font-extrabold normal-case tracking-normal">Datos de contacto</h2>
            <dl>
              <Row label="Nombre">{lead.name}</Row>
              <Row label="Email">{lead.email && <a href={`mailto:${lead.email}`} className="font-semibold text-gold-dark hover:underline">{lead.email}</a>}</Row>
              <Row label="Teléfono">{lead.phone}</Row>
              <Row label="Idioma">{lead.locale === "en" ? "Inglés" : "Español"}</Row>
            </dl>
          </Card>
          <Card>
            <h2 className="mb-2 font-sans text-base font-extrabold normal-case tracking-normal">Solicitud</h2>
            <dl>
              <Row label="Proyecto">{lead.project?.name}</Row>
              <Row label="Propiedad">
                {lead.property && (
                  <a href={`/es/propiedades/${lead.property.slug_es}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-gold-dark hover:underline">
                    {lead.property.title?.es} <ExternalLink className="size-3" />
                  </a>
                )}
              </Row>
              <Row label="Interés">{lead.interest}</Row>
              <Row label="Presupuesto">{lead.budget}</Row>
              <Row label="Mensaje">{lead.message && <span className="whitespace-pre-wrap">{lead.message}</span>}</Row>
            </dl>
          </Card>
          {(lead.type === "visit" || lead.visit_date) && (
            <Card className="border-gold bg-gold-soft/20">
              <h2 className="mb-2 flex items-center gap-2 font-sans text-base font-extrabold normal-case tracking-normal">
                <Calendar className="size-4 text-gold-dark" /> Visita solicitada
              </h2>
              <dl>
                <Row label="Fecha">{lead.visit_date}</Row>
                <Row label="Hora">{lead.visit_time}</Row>
                <Row label="Modalidad">{lead.visit_mode === "virtual" ? "Virtual" : lead.visit_mode === "presencial" ? "Presencial" : null}</Row>
              </dl>
            </Card>
          )}
          <Card>
            <h2 className="mb-2 font-sans text-base font-extrabold normal-case tracking-normal">Origen</h2>
            <dl>
              <Row label="URL de origen">
                {lead.source_url && (
                  <a href={lead.source_url} target="_blank" rel="noreferrer" className="break-all font-semibold text-gold-dark hover:underline">
                    {lead.source_url}
                  </a>
                )}
              </Row>
              {utm.length === 0 ? (
                <Row label="UTM">{null}</Row>
              ) : (
                utm.map(([k, v]) => (
                  <Row key={k} label={k}>
                    {String(v)}
                  </Row>
                ))
              )}
            </dl>
          </Card>
          {profile.role === "admin" && (
            <div className="flex justify-end">
              <ConfirmActionButton action={deleteLead.bind(null, lead.id)} confirmText="¿Eliminar este lead y sus notas? Esta acción no se puede deshacer." label="Eliminar lead" />
            </div>
          )}
        </div>
        <Card className="h-fit lg:sticky lg:top-20">
          <h2 className="mb-3 font-sans text-base font-extrabold normal-case tracking-normal">Notas internas</h2>
          <LeadNotes leadId={lead.id} initial={(notes ?? []) as LeadNote[]} />
        </Card>
      </div>
    </>
  );
}
