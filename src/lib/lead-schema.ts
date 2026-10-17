import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

export const leadSchema = z
  .object({
    type: z.enum(["info", "price", "visit"]),
    name: z.string().trim().min(2, "name").max(120),
    email: z.email("email").max(160),
    phone: z
      .string()
      .trim()
      .min(7, "phone")
      .max(30)
      .regex(/^[+()\d\s.-]+$/, "phone"),
    projectId: z.uuid().optional().or(z.literal("")).nullable(),
    propertyId: z.uuid().optional().or(z.literal("")).nullable(),
    interest: optionalText(160).nullable(),
    budget: optionalText(60),
    message: optionalText(2000),
    locale: z.enum(["es", "en"]),
    visitDate: optionalText(10),
    visitTime: optionalText(5),
    visitMode: z.enum(["presencial", "virtual"]).optional(),
    sourceUrl: optionalText(500),
    utm: z.record(z.string(), z.string().max(200)).optional(),
    turnstileToken: z.string().optional(),
    website: z.string().optional(), // honeypot
    consent: z.literal(true, "consent"),
  })
  .refine((d) => d.type !== "visit" || (d.visitDate && d.visitTime), { message: "visit", path: ["visitDate"] });

export type LeadInput = z.input<typeof leadSchema>;
export type LeadResult =
  | { ok: true }
  | { ok: false; error: "validation" | "rate_limit" | "server" | "captcha"; fieldErrors?: Record<string, string[]> };
