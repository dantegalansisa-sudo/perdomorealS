import { NextResponse, type NextRequest } from "next/server";
import { getTranslations } from "next-intl/server";
import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage } from "pdf-lib";
import { getModels, getProjects, getSettings } from "@/lib/data";
import { SITE_URL } from "@/lib/env";
import { formatDate } from "@/lib/format";
import type { Locale } from "@/lib/types";
import { tr } from "@/lib/utils";


const NAVY = rgb(11 / 255, 31 / 255, 58 / 255);
const GOLD = rgb(201 / 255, 169 / 255, 97 / 255);
const STONE = rgb(123 / 255, 116 / 255, 104 / 255);
const LINE = rgb(230 / 255, 224 / 255, 212 / 255);
const SAND = rgb(250 / 255, 248 / 255, 244 / 255);

const A4: [number, number] = [595.28, 841.89];
const M = 48; // page margin

/** Characters outside WinAnsi that commonly appear in content → safe replacements. */
const REPLACEMENTS: Record<string, string> = {
  "²": "2",
  "³": "3",
  "≈": "~",
  "→": "->",
  "←": "<-",
  "✓": "-",
  " ": " ",
  " ": " ",
  " ": " ",
  "‑": "-",
  "−": "-",
};

function makeSanitizer(font: PDFFont) {
  const cache = new Map<string, string>();
  return (input: string) => {
    let out = "";
    for (const ch of input.normalize("NFC").replace(/[\r\t]/g, " ")) {
      if (ch === "\n") {
        out += ch;
        continue;
      }
      let rep = cache.get(ch);
      if (rep === undefined) {
        rep = REPLACEMENTS[ch] ?? ch;
        try {
          font.widthOfTextAtSize(rep, 10);
        } catch {
          // Strip diacritics as a last resort, else drop the glyph.
          const base = ch.normalize("NFD").replace(/[̀-ͯ]/g, "");
          try {
            font.widthOfTextAtSize(base, 10);
            rep = base;
          } catch {
            rep = "";
          }
        }
        cache.set(ch, rep);
      }
      out += rep;
    }
    return out;
  };
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number) {
  const lines: string[] = [];
  for (const para of text.split("\n")) {
    let line = "";
    for (const word of para.split(/\s+/).filter(Boolean)) {
      const next = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(next, size) <= maxWidth) line = next;
      else {
        if (line) lines.push(line);
        line = word;
      }
    }
    lines.push(line);
  }
  return lines;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale: Locale = req.nextUrl.searchParams.get("locale") === "en" ? "en" : "es";
  const projects = await getProjects();
  const project = projects.find((p) => p.slug_es === slug || p.slug_en === slug);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (project.brochure_url && /^https?:\/\//.test(project.brochure_url)) return NextResponse.redirect(project.brochure_url, 307);

  const [models, settings, t, tc] = await Promise.all([
    getModels(project.id),
    getSettings(),
    getTranslations({ locale, namespace: "project.brochure" }),
    getTranslations({ locale, namespace: "common" }),
  ]);

  const pdf = await PDFDocument.create();
  pdf.setTitle(`${project.name} — Perdomo Real Estate`);
  pdf.setAuthor("Perdomo Real Estate");
  pdf.setLanguage(locale === "en" ? "en-US" : "es-DO");
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const clean = makeSanitizer(regular);
  const W = A4[0] - M * 2;

  let page: PDFPage = pdf.addPage(A4);
  let y = 0;

  const header = (first: boolean) => {
    const h = first ? 120 : 54;
    page.drawRectangle({ x: 0, y: A4[1] - h, width: A4[0], height: h, color: NAVY });
    page.drawText("PERDOMO REAL ESTATE", { x: M, y: A4[1] - 32, size: 10, font: bold, color: GOLD });
    page.drawText(clean(project.location_name), { x: A4[0] - M - regular.widthOfTextAtSize(clean(project.location_name), 9), y: A4[1] - 32, size: 9, font: regular, color: rgb(1, 1, 1) });
    if (first) {
      page.drawText(clean(project.name.toUpperCase()), { x: M, y: A4[1] - 74, size: 28, font: bold, color: rgb(1, 1, 1) });
      page.drawText(clean(tr(project.tagline, locale)), { x: M, y: A4[1] - 98, size: 12, font: regular, color: GOLD });
    }
    y = A4[1] - h - 30;
  };
  const newPage = () => {
    page = pdf.addPage(A4);
    header(false);
  };
  const ensure = (needed: number) => {
    if (y - needed < M + 40) newPage();
  };
  const heading = (text: string) => {
    ensure(40);
    y -= 6;
    page.drawText(clean(text.toUpperCase()), { x: M, y, size: 11, font: bold, color: NAVY });
    page.drawRectangle({ x: M, y: y - 6, width: 28, height: 2, color: GOLD });
    y -= 22;
  };
  const paragraph = (text: string, size = 10, color = STONE, font = regular) => {
    for (const line of wrap(clean(text), font, size, W)) {
      ensure(size + 6);
      page.drawText(line, { x: M, y, size, font, color });
      y -= size + 5;
    }
  };

  header(true);

  // Description
  paragraph(tr(project.description, locale), 10.5, NAVY);
  y -= 12;

  // Key facts grid
  heading(t("keyFacts"));
  const usd = (n: number | null) => (n == null ? tc("priceOnRequest") : `USD ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n)}`);
  const facts: [string, string][] = [
    [t("priceFrom"), usd(project.price_from)],
    [t("units"), String(project.total_units)],
    [t("delivery"), project.delivery_date ? formatDate(project.delivery_date, locale, { month: "long", year: "numeric", timeZone: "UTC" }) : "-"],
    [t("status"), tc(`status.${project.status}`)],
  ];
  const colW = W / 4;
  ensure(52);
  page.drawRectangle({ x: M, y: y - 34, width: W, height: 48, color: SAND, borderColor: LINE, borderWidth: 1 });
  facts.forEach(([label, value], i) => {
    const x = M + 12 + i * colW;
    page.drawText(clean(label.toUpperCase()), { x, y: y, size: 7, font: bold, color: STONE });
    const v = clean(value);
    let size = 11;
    while (size > 7 && bold.widthOfTextAtSize(v, size) > colW - 18) size -= 0.5;
    page.drawText(v, { x, y: y - 18, size, font: bold, color: NAVY });
  });
  y -= 62;

  // Models table
  if (models.length) {
    heading(t("models"));
    const cols = [t("model"), t("beds"), t("baths"), t("built"), t("lot"), t("from")];
    const widths = [0.24, 0.1, 0.1, 0.18, 0.18, 0.2].map((f) => f * W);
    const row = (cells: string[], isHead: boolean) => {
      ensure(22);
      if (isHead) page.drawRectangle({ x: M, y: y - 6, width: W, height: 20, color: NAVY });
      let x = M + 8;
      cells.forEach((c, i) => {
        page.drawText(clean(c), { x, y, size: isHead ? 8 : 9.5, font: isHead ? bold : i === 0 ? bold : regular, color: isHead ? rgb(1, 1, 1) : NAVY });
        x += widths[i];
      });
      if (!isHead) page.drawLine({ start: { x: M, y: y - 7 }, end: { x: M + W, y: y - 7 }, thickness: 0.6, color: LINE });
      y -= 22;
    };
    row(cols, true);
    models.forEach((m) =>
      row([m.name, String(m.bedrooms), String(m.bathrooms), String(m.built_m2), String(m.lot_m2), m.price_from ? new Intl.NumberFormat("en-US").format(m.price_from) : "-"], false)
    );
    y -= 10;
  }

  // Amenities
  if (project.amenities.length) {
    heading(t("amenities"));
    paragraph(project.amenities.map((a) => tc(`amenities.${a}`)).join("  ·  "), 10, NAVY);
    y -= 10;
  }

  // Payment plans
  if (project.payment_plans.length) {
    heading(t("paymentPlans"));
    for (const p of project.payment_plans) {
      ensure(34);
      page.drawText(clean(tr(p.name, locale)), { x: M, y, size: 10, font: bold, color: NAVY });
      y -= 14;
      paragraph(
        p.installments > 0
          ? t("planRow", { down: p.down, during: p.during, installments: p.installments, delivery: p.delivery })
          : t("planRowSimple", { down: p.down, during: p.during, delivery: p.delivery }),
        9.5,
        STONE
      );
      y -= 4;
    }
    y -= 6;
  }

  // Contact
  heading(t("contact"));
  const contact: [string, string][] = [
    [t("whatsapp"), settings.whatsapp_number ? `+${settings.whatsapp_number.replace(/\D/g, "")}` : ""],
    [t("phone"), settings.phone],
    [t("email"), settings.email],
    [t("web"), SITE_URL.replace(/^https?:\/\//, "")],
  ];
  for (const [label, value] of contact.filter(([, v]) => v)) {
    ensure(16);
    page.drawText(clean(`${label}:`), { x: M, y, size: 10, font: bold, color: NAVY });
    page.drawText(clean(value), { x: M + 80, y, size: 10, font: regular, color: NAVY });
    y -= 16;
  }

  // Footers on every page
  const pages = pdf.getPages();
  pages.forEach((pg, i) => {
    pg.drawLine({ start: { x: M, y: 50 }, end: { x: A4[0] - M, y: 50 }, thickness: 0.6, color: LINE });
    const disclaimer = clean(t("disclaimer"));
    const discLines = wrap(disclaimer, regular, 7, W - 90);
    discLines.slice(0, 2).forEach((l, j) => pg.drawText(l, { x: M, y: 38 - j * 9, size: 7, font: regular, color: STONE }));
    const num = clean(t("page", { n: i + 1, total: pages.length }));
    pg.drawText(num, { x: A4[0] - M - regular.widthOfTextAtSize(num, 7.5), y: 38, size: 7.5, font: regular, color: STONE });
    if (project.is_placeholder) {
      const note = "Información de ejemplo / Sample information";
      const safe = clean(note);
      const w = bold.widthOfTextAtSize(safe, 8);
      pg.drawRectangle({ x: (A4[0] - w) / 2 - 10, y: 58, width: w + 20, height: 16, color: rgb(236 / 255, 224 / 255, 195 / 255) });
      pg.drawText(safe, { x: (A4[0] - w) / 2, y: 63, size: 8, font: bold, color: rgb(168 / 255, 139 / 255, 69 / 255) });
    }
  });

  const bytes = await pdf.save();
  const filename = `${project.slug_es || "brochure"}-${locale}.pdf`.replace(/[^a-z0-9.-]/gi, "-");
  const body = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=86400",
      "X-Robots-Tag": "noindex",
    },
  });
}
