import type { Faq, Post, Project, Property, VillaModel } from "@/lib/types";

export type ProjectForm = Omit<Project, "id" | "created_at" | "media">;
export type PropertyForm = Omit<Property, "id" | "created_at" | "media">;
export type PostForm = Omit<Post, "id">;
export type ModelForm = Omit<VillaModel, "id" | "media">;
export type FaqForm = Omit<Faq, "id" | "sort">;

const t = () => ({ es: "", en: "" });

export function emptyProject(): ProjectForm {
  return {
    slug_es: "",
    slug_en: "",
    name: "",
    tagline: t(),
    description: t(),
    location_name: "",
    zone: "",
    lat: 18.7357,
    lng: -68.4537,
    status: "preventa",
    amenities: [],
    timeline: [],
    payment_plans: [],
    documents: [],
    developer: { name: "", description: t(), website: "" },
    distances: [],
    price_from: null,
    delivery_date: null,
    total_units: 0,
    video_url: null,
    tour_url: null,
    brochure_url: null,
    featured: false,
    published: false,
    is_flagship: false,
    seo: { es: { title: "", description: "" }, en: { title: "", description: "" } },
    is_placeholder: false,
    sort: 0,
  };
}

/** Normalizes a DB row (jsonb may be partial / null) into a complete form object. */
export function projectToForm(p: Project): ProjectForm {
  const e = emptyProject();
  return {
    ...e,
    ...Object.fromEntries(Object.entries(p).filter(([k]) => k in e)),
    tagline: { ...t(), ...(p.tagline ?? {}) },
    description: { ...t(), ...(p.description ?? {}) },
    developer: { ...e.developer, ...(p.developer ?? {}), description: { ...t(), ...(p.developer?.description ?? {}) } },
    timeline: Array.isArray(p.timeline) ? p.timeline : [],
    payment_plans: Array.isArray(p.payment_plans) ? p.payment_plans : [],
    documents: Array.isArray(p.documents) ? p.documents : [],
    distances: Array.isArray(p.distances) ? p.distances : [],
    amenities: p.amenities ?? [],
    seo: p.seo ?? {},
    price_from: p.price_from === null || p.price_from === undefined ? null : Number(p.price_from),
  } as ProjectForm;
}

export function emptyProperty(): PropertyForm {
  return {
    slug_es: "",
    slug_en: "",
    title: t(),
    description: t(),
    type: "villa",
    zone: "",
    project_id: null,
    price: null,
    bedrooms: 0,
    bathrooms: 0,
    built_m2: 0,
    lot_m2: 0,
    status: "listo",
    amenities: [],
    lat: 18.6,
    lng: -68.4,
    badges: [],
    featured: false,
    published: false,
    video_url: null,
    tour_url: null,
    seo: { es: { title: "", description: "" }, en: { title: "", description: "" } },
    is_placeholder: false,
  };
}

export function propertyToForm(p: Property): PropertyForm {
  const e = emptyProperty();
  return {
    ...e,
    ...Object.fromEntries(Object.entries(p).filter(([k]) => k in e)),
    title: { ...t(), ...(p.title ?? {}) },
    description: { ...t(), ...(p.description ?? {}) },
    amenities: p.amenities ?? [],
    badges: p.badges ?? [],
    seo: p.seo ?? {},
    price: p.price === null || p.price === undefined ? null : Number(p.price),
    bathrooms: Number(p.bathrooms ?? 0),
    built_m2: Number(p.built_m2 ?? 0),
    lot_m2: Number(p.lot_m2 ?? 0),
  } as PropertyForm;
}

export function emptyPost(): PostForm {
  return {
    slug_es: "",
    slug_en: "",
    title: t(),
    excerpt: t(),
    content: t(),
    category: "guias",
    cover_url: null,
    author: "Perdomo Real Estate",
    published: false,
    published_at: new Date().toISOString(),
    seo: { es: { title: "", description: "" }, en: { title: "", description: "" } },
    is_placeholder: false,
  };
}

export function postToForm(p: Post): PostForm {
  const e = emptyPost();
  return {
    ...e,
    ...Object.fromEntries(Object.entries(p).filter(([k]) => k in e)),
    title: { ...t(), ...(p.title ?? {}) },
    excerpt: { ...t(), ...(p.excerpt ?? {}) },
    content: { ...t(), ...(p.content ?? {}) },
    seo: p.seo ?? {},
  } as PostForm;
}

export function modelToForm(m: VillaModel): ModelForm {
  return {
    project_id: m.project_id,
    code: m.code,
    name: m.name,
    bedrooms: Number(m.bedrooms ?? 0),
    bathrooms: Number(m.bathrooms ?? 0),
    built_m2: Number(m.built_m2 ?? 0),
    lot_m2: Number(m.lot_m2 ?? 0),
    price_from: m.price_from === null || m.price_from === undefined ? null : Number(m.price_from),
    description: { ...t(), ...(m.description ?? {}) },
    features: Array.isArray(m.features) ? m.features : [],
    sort: m.sort ?? 0,
    is_placeholder: !!m.is_placeholder,
  };
}
