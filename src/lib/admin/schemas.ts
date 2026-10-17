import { z } from "zod";
import { AMENITY_KEYS } from "./constants";

// ───────── primitives ─────────
export const i18n = z.object({
  es: z.string().trim().max(20000).default(""),
  en: z.string().trim().max(20000).default(""),
});
export const i18nRequiredEs = z.object({
  es: z.string().trim().min(1, "El texto en español es obligatorio").max(20000),
  en: z.string().trim().max(20000).default(""),
});
/** Rich text (HTML) — larger limit. */
export const i18nHtml = z.object({
  es: z.string().max(400000).default(""),
  en: z.string().max(400000).default(""),
});

const isUrlish = (v: string) => /^(https?:\/\/|\/)/i.test(v);
/** Optional URL: "" → null. */
export const optUrl = z
  .string()
  .trim()
  .max(2000)
  .nullable()
  .optional()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || isUrlish(v), "La URL debe empezar por https:// o /");

export const optText = z
  .string()
  .trim()
  .max(500)
  .nullable()
  .optional()
  .transform((v) => (v ? v : null));

export const slug = z
  .string()
  .trim()
  .min(1, "El slug es obligatorio")
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "El slug solo puede tener minúsculas, números y guiones");

const num = (msg = "Número inválido") => z.number({ error: msg }).finite(msg);
export const optNum = num().min(0, "No puede ser negativo").nullable().optional().transform((v) => (v ?? null));
const nonNeg = num().min(0, "No puede ser negativo");

export const seo = z.object({
  es: z.object({ title: z.string().trim().max(200).default(""), description: z.string().trim().max(400).default("") }).default({ title: "", description: "" }),
  en: z.object({ title: z.string().trim().max(200).default(""), description: z.string().trim().max(400).default("") }).default({ title: "", description: "" }),
});

export const amenities = z.array(z.enum(AMENITY_KEYS)).default([]);
export const constructionStatus = z.enum(["preventa", "construccion", "listo"]);

// ───────── projects ─────────
export const timelineStep = z.object({
  phase: i18nRequiredEs,
  date: z.string().trim().max(60).default(""),
  progress: num().min(0, "El progreso va de 0 a 100").max(100, "El progreso va de 0 a 100"),
});

export const paymentPlan = z
  .object({
    id: z.string().trim().min(1, "El plan necesita un ID").max(60),
    name: i18nRequiredEs,
    down: nonNeg.max(100),
    during: nonNeg.max(100),
    delivery: nonNeg.max(100),
    installments: z.number().int("Las cuotas deben ser un número entero").min(0),
  })
  .refine((p) => Math.round((p.down + p.during + p.delivery) * 100) / 100 === 100, {
    message: "Los porcentajes del plan deben sumar 100%",
    path: ["down"],
  });

export const projectDocument = z.object({
  name: i18nRequiredEs,
  url: z.string().trim().max(2000).default(""),
});

export const distance = z.object({
  label: i18nRequiredEs,
  value: z.string().trim().max(60).default(""),
  minutes: num().min(0).nullable().optional().transform((v) => (v ?? undefined)),
});

export const developer = z.object({
  name: z.string().trim().max(200).default(""),
  description: i18n,
  website: z.string().trim().max(500).default(""),
});

export const projectSchema = z
  .object({
    name: z.string().trim().min(2, "El nombre es obligatorio").max(200),
    slug_es: slug,
    slug_en: slug,
    tagline: i18n,
    description: i18n,
    location_name: z.string().trim().max(200).default(""),
    zone: z.string().trim().max(120).default(""),
    lat: num("Latitud inválida").min(-90).max(90),
    lng: num("Longitud inválida").min(-180).max(180),
    status: constructionStatus,
    amenities,
    timeline: z.array(timelineStep).max(40).default([]),
    payment_plans: z.array(paymentPlan).max(20).default([]),
    documents: z.array(projectDocument).max(40).default([]),
    developer,
    distances: z.array(distance).max(40).default([]),
    price_from: optNum,
    delivery_date: z
      .string()
      .nullable()
      .optional()
      .transform((v) => (v ? v : null))
      .refine((v) => v === null || /^\d{4}-\d{2}-\d{2}$/.test(v), "Fecha de entrega inválida"),
    total_units: z.number().int().min(0).default(0),
    video_url: optUrl,
    tour_url: optUrl,
    brochure_url: optUrl,
    featured: z.boolean().default(false),
    published: z.boolean().default(false),
    is_flagship: z.boolean().default(false),
    seo,
    is_placeholder: z.boolean().default(false),
    sort: z.number().int().default(0),
  })
  .superRefine((p, ctx) => {
    const ids = new Set<string>();
    p.payment_plans.forEach((plan, i) => {
      if (ids.has(plan.id)) ctx.addIssue({ code: "custom", message: "IDs de plan repetidos", path: ["payment_plans", i, "id"] });
      ids.add(plan.id);
    });
  });
export type ProjectInput = z.input<typeof projectSchema>;

export const villaModelSchema = z.object({
  project_id: z.string().uuid(),
  code: z.string().trim().min(1, "El código es obligatorio").max(40),
  name: z.string().trim().min(1, "El nombre es obligatorio").max(160),
  bedrooms: z.number().int().min(0),
  bathrooms: nonNeg,
  built_m2: nonNeg,
  lot_m2: nonNeg,
  price_from: optNum,
  description: i18n,
  features: z.array(i18nRequiredEs).max(60).default([]),
  sort: z.number().int().default(0),
  is_placeholder: z.boolean().default(false),
});
export type VillaModelInput = z.input<typeof villaModelSchema>;

// ───────── units ─────────
export const unitStatus = z.enum(["available", "reserved", "sold"]);
export const unitPatchSchema = z
  .object({
    code: z.string().trim().min(1, "El código es obligatorio").max(40),
    lot_number: z.number().int("El lote debe ser entero").min(0),
    model_id: z.string().uuid().nullable(),
    status: unitStatus,
    price: optNum,
    lot_m2: optNum,
    built_m2: optNum,
    is_placeholder: z.boolean(),
  })
  .partial();

// ───────── properties ─────────
export const propertySchema = z.object({
  title: i18nRequiredEs,
  description: i18n,
  slug_es: slug,
  slug_en: slug,
  type: z.enum(["villa", "apartment", "house", "land"]),
  zone: z.string().trim().max(120).default(""),
  project_id: z
    .string()
    .nullable()
    .optional()
    .transform((v) => (v ? v : null))
    .refine((v) => v === null || /^[0-9a-f-]{36}$/i.test(v), "Proyecto inválido"),
  price: optNum,
  bedrooms: z.number().int().min(0),
  bathrooms: nonNeg,
  built_m2: nonNeg,
  lot_m2: nonNeg,
  status: constructionStatus,
  amenities,
  lat: num("Latitud inválida").min(-90).max(90),
  lng: num("Longitud inválida").min(-180).max(180),
  badges: z.array(z.enum(["new", "presale", "last_units", "sold"])).default([]),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  video_url: optUrl,
  tour_url: optUrl,
  seo,
  is_placeholder: z.boolean().default(false),
});
export type PropertyInput = z.input<typeof propertySchema>;

// ───────── posts ─────────
export const postSchema = z.object({
  title: i18nRequiredEs,
  excerpt: i18n,
  content: i18nHtml,
  slug_es: slug,
  slug_en: slug,
  category: z.string().refine((v) => ["guias", "zonas", "inversion", "legal", "noticias"].includes(v), "Categoría inválida"),
  cover_url: optUrl,
  author: z.string().trim().min(1, "El autor es obligatorio").max(120),
  published: z.boolean().default(false),
  published_at: z.string().refine((v) => !Number.isNaN(Date.parse(v)), "Fecha de publicación inválida"),
  seo,
  is_placeholder: z.boolean().default(false),
});
export type PostInput = z.input<typeof postSchema>;

// ───────── faqs ─────────
export const faqSchema = z.object({
  project_id: z
    .string()
    .nullable()
    .optional()
    .transform((v) => (v ? v : null)),
  question: i18nRequiredEs,
  answer: i18nRequiredEs,
  published: z.boolean().default(true),
  is_placeholder: z.boolean().default(false),
});
export type FaqInput = z.input<typeof faqSchema>;

// ───────── leads ─────────
export const leadStatus = z.enum(["new", "contacted", "visit", "negotiation", "closed", "lost"]);
export const leadNoteSchema = z.object({
  lead_id: z.string().uuid(),
  body: z.string().trim().min(1, "La nota no puede estar vacía").max(5000),
});

// ───────── settings ─────────
export const settingsSchema = z.object({
  whatsapp_number: z
    .string()
    .trim()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length >= 8 && v.length <= 15, "El número de WhatsApp debe tener entre 8 y 15 dígitos (con código de país)"),
  whatsapp_default_message: i18n,
  whatsapp_project_messages: z.record(z.string(), i18n).default({}),
  email: z.union([z.literal(""), z.email("Correo inválido")]).default(""),
  phone: z.string().trim().max(60).default(""),
  address: z.string().trim().max(300).default(""),
  socials: z.object({
    instagram: z.string().trim().max(300).default(""),
    facebook: z.string().trim().max(300).default(""),
    youtube: z.string().trim().max(300).default(""),
    tiktok: z.string().trim().max(300).default(""),
    linkedin: z.string().trim().max(300).default(""),
  }),
  hero: z.object({ title: i18n, subtitle: i18n }),
  exchange_rates: z.object({
    DOP: num("Tasa DOP inválida").positive("La tasa debe ser mayor que 0"),
    EUR: num("Tasa EUR inválida").positive("La tasa debe ser mayor que 0"),
  }),
  gtm_id: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((v) => (v ? v.toUpperCase() : null))
    .refine((v) => v === null || /^GTM-[A-Z0-9]+$/.test(v), "El GTM ID debe tener el formato GTM-XXXXXXX"),
  ga4_id: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((v) => (v ? v.toUpperCase() : null))
    .refine((v) => v === null || /^G-[A-Z0-9]+$/.test(v), "El GA4 ID debe tener el formato G-XXXXXXX"),
  show_placeholder_labels: z.boolean(),
});
export type SettingsInput = z.input<typeof settingsSchema>;

export const inviteSchema = z.object({
  email: z.email("Correo inválido"),
  role: z.enum(["admin", "editor"]),
});
