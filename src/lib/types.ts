export type Locale = "es" | "en";
/** Bilingual text stored as { es, en } in jsonb columns. */
export type I18nText = { es: string; en: string };

export type ConstructionStatus = "preventa" | "construccion" | "listo";
export type PropertyType = "villa" | "apartment" | "house" | "land";
export type UnitStatus = "available" | "reserved" | "sold";
export type Badge = "new" | "presale" | "last_units" | "sold";
export type AmenityKey =
  | "pool"
  | "sea_view"
  | "gated"
  | "furnished"
  | "gym"
  | "clubhouse"
  | "beach_access"
  | "golf"
  | "security"
  | "playground"
  | "bbq"
  | "parking"
  | "garden"
  | "rooftop"
  | "spa"
  | "coworking";

export type Seo = { es?: { title?: string; description?: string }; en?: { title?: string; description?: string } };

export type MediaItem = {
  id: string;
  owner_type: "project" | "property" | "post" | "model";
  owner_id: string;
  url: string;
  path?: string | null;
  alt: I18nText;
  sort: number;
  is_cover: boolean;
  kind: "image" | "floorplan";
  width?: number | null;
  height?: number | null;
};

export type TimelineStep = { phase: I18nText; date: string; progress: number };
export type PaymentPlan = {
  id: string;
  name: I18nText;
  down: number; // % at signing
  during: number; // % during construction
  delivery: number; // % on delivery
  installments: number; // number of monthly installments during construction
};
export type ProjectDocument = { name: I18nText; url: string };
export type Distance = { label: I18nText; value: string; minutes?: number };
export type Developer = { name: string; description: I18nText; website?: string };

export type Project = {
  id: string;
  slug_es: string;
  slug_en: string;
  name: string;
  tagline: I18nText;
  description: I18nText;
  location_name: string;
  zone: string;
  lat: number;
  lng: number;
  status: ConstructionStatus;
  amenities: AmenityKey[];
  timeline: TimelineStep[];
  payment_plans: PaymentPlan[];
  documents: ProjectDocument[];
  developer: Developer;
  distances: Distance[];
  price_from: number | null;
  delivery_date: string | null;
  total_units: number;
  video_url: string | null;
  tour_url: string | null;
  brochure_url: string | null;
  featured: boolean;
  published: boolean;
  is_flagship: boolean;
  seo: Seo;
  is_placeholder: boolean;
  sort: number;
  created_at: string;
  media?: MediaItem[];
};

export type VillaModel = {
  id: string;
  project_id: string;
  code: string;
  name: string;
  bedrooms: number;
  bathrooms: number;
  built_m2: number;
  lot_m2: number;
  price_from: number | null;
  description: I18nText;
  features: I18nText[];
  sort: number;
  is_placeholder: boolean;
  media?: MediaItem[];
};

export type Unit = {
  id: string;
  project_id: string;
  model_id: string | null;
  code: string;
  lot_number: number;
  status: UnitStatus;
  price: number | null;
  lot_m2: number | null;
  built_m2: number | null;
  is_placeholder: boolean;
};

export type Property = {
  id: string;
  slug_es: string;
  slug_en: string;
  title: I18nText;
  description: I18nText;
  type: PropertyType;
  zone: string;
  project_id: string | null;
  price: number | null;
  bedrooms: number;
  bathrooms: number;
  built_m2: number;
  lot_m2: number;
  status: ConstructionStatus;
  amenities: AmenityKey[];
  lat: number;
  lng: number;
  badges: Badge[];
  featured: boolean;
  published: boolean;
  video_url: string | null;
  tour_url: string | null;
  seo: Seo;
  is_placeholder: boolean;
  created_at: string;
  media?: MediaItem[];
};

export type Post = {
  id: string;
  slug_es: string;
  slug_en: string;
  title: I18nText;
  excerpt: I18nText;
  content: I18nText; // HTML
  category: string;
  cover_url: string | null;
  author: string;
  published: boolean;
  published_at: string;
  seo: Seo;
  is_placeholder: boolean;
};

export type Faq = {
  id: string;
  project_id: string | null;
  question: I18nText;
  answer: I18nText;
  sort: number;
  published: boolean;
  is_placeholder: boolean;
};

export type LeadType = "info" | "price" | "visit" | "whatsapp_click";
export type LeadStatus = "new" | "contacted" | "visit" | "negotiation" | "closed" | "lost";

export type Lead = {
  id: string;
  created_at: string;
  type: LeadType;
  status: LeadStatus;
  name: string | null;
  email: string | null;
  phone: string | null;
  project_id: string | null;
  property_id: string | null;
  interest: string | null;
  budget: string | null;
  message: string | null;
  locale: Locale;
  visit_date: string | null;
  visit_time: string | null;
  visit_mode: "presencial" | "virtual" | null;
  source_url: string | null;
  utm: Record<string, string> | null;
};

export type LeadNote = { id: string; lead_id: string; author: string | null; body: string; created_at: string };

export type SiteSettings = {
  id: number;
  whatsapp_number: string; // digits only, international format, e.g. 18095550123
  whatsapp_default_message: I18nText;
  whatsapp_project_messages: Record<string, I18nText>; // project id → message
  email: string;
  phone: string;
  address: string;
  socials: { instagram?: string; facebook?: string; youtube?: string; tiktok?: string; linkedin?: string };
  hero: { title: I18nText; subtitle: I18nText };
  exchange_rates: { DOP: number; EUR: number }; // 1 USD = x
  gtm_id: string | null;
  ga4_id: string | null;
  show_placeholder_labels: boolean;
};

export type Profile = { id: string; email: string; role: "admin" | "editor"; full_name?: string | null };
