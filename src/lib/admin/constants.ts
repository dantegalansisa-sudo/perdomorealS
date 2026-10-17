import type {
  AmenityKey,
  Badge,
  ConstructionStatus,
  LeadStatus,
  LeadType,
  PropertyType,
  UnitStatus,
} from "@/lib/types";

export const AMENITIES: { key: AmenityKey; label: string }[] = [
  { key: "pool", label: "Piscina" },
  { key: "sea_view", label: "Vista al mar" },
  { key: "gated", label: "Comunidad cerrada" },
  { key: "furnished", label: "Amueblado" },
  { key: "gym", label: "Gimnasio" },
  { key: "clubhouse", label: "Club house" },
  { key: "beach_access", label: "Acceso a playa" },
  { key: "golf", label: "Golf" },
  { key: "security", label: "Seguridad 24/7" },
  { key: "playground", label: "Área infantil" },
  { key: "bbq", label: "Área BBQ" },
  { key: "parking", label: "Parqueo" },
  { key: "garden", label: "Jardín" },
  { key: "rooftop", label: "Rooftop" },
  { key: "spa", label: "Spa" },
  { key: "coworking", label: "Coworking" },
];
export const AMENITY_KEYS = AMENITIES.map((a) => a.key) as [AmenityKey, ...AmenityKey[]];

export const CONSTRUCTION_STATUS: Record<ConstructionStatus, string> = {
  preventa: "Preventa",
  construccion: "En construcción",
  listo: "Listo para entrega",
};

export const PROPERTY_TYPES: Record<PropertyType, string> = {
  villa: "Villa",
  apartment: "Apartamento",
  house: "Casa",
  land: "Terreno",
};

export const BADGES: Record<Badge, string> = {
  new: "Nuevo",
  presale: "Preventa",
  last_units: "Últimas unidades",
  sold: "Vendido",
};

export const UNIT_STATUS: Record<UnitStatus, string> = {
  available: "Disponible",
  reserved: "Reservada",
  sold: "Vendida",
};

export const UNIT_STATUS_COLOR: Record<UnitStatus, string> = {
  available: "bg-available",
  reserved: "bg-reserved",
  sold: "bg-sold",
};

export const LEAD_STATUS: Record<LeadStatus, string> = {
  new: "Nuevo",
  contacted: "Contactado",
  visit: "Visita",
  negotiation: "Negociación",
  closed: "Cerrado",
  lost: "Perdido",
};

export const LEAD_STATUS_STYLE: Record<LeadStatus, string> = {
  new: "bg-gold-soft text-navy border-gold",
  contacted: "bg-sky-50 text-sky-800 border-sky-200",
  visit: "bg-violet-50 text-violet-800 border-violet-200",
  negotiation: "bg-amber-50 text-amber-800 border-amber-200",
  closed: "bg-emerald-50 text-emerald-800 border-emerald-200",
  lost: "bg-stone-100 text-stone-600 border-stone-200",
};

export const LEAD_TYPES: Record<LeadType, string> = {
  info: "Información",
  price: "Precios",
  visit: "Visita",
  whatsapp_click: "Clic WhatsApp",
};

export const POST_CATEGORIES: Record<string, string> = {
  guias: "Guías",
  zonas: "Zonas",
  inversion: "Inversión",
  legal: "Legal",
  noticias: "Noticias",
};

export const ZONE_SUGGESTIONS = ["Macao", "Bávaro", "Cap Cana", "Punta Cana", "Uvero Alto", "Cabeza de Toro", "Cocotal", "Los Corales"];

export const emptyI18n = () => ({ es: "", en: "" });
