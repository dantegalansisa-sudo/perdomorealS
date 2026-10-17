/**
 * Sample content. EVERYTHING here is invented and flagged `is_placeholder: true`.
 * Used (1) as the offline fallback when Supabase isn't configured and
 * (2) by `npm run seed` to populate a fresh Supabase project.
 */
import type {
  Faq,
  PaymentPlan,
  Post,
  Project,
  Property,
  SiteSettings,
  Unit,
  UnitStatus,
  VillaModel,
} from "@/lib/types";

const uid = (group: number, n: number) =>
  `00000000-0000-4000-8${group.toString().padStart(3, "0")}-${n.toString().padStart(12, "0")}`;

export const FLAGSHIP_ID = uid(1, 1);
const ALTAMAR_ID = uid(1, 2);
const GARDEN_ID = uid(1, 3);

const t = (es: string, en: string) => ({ es, en });

const standardPlans: PaymentPlan[] = [
  { id: "plan-30-40-30", name: t("Plan Equilibrado", "Balanced Plan"), down: 30, during: 40, delivery: 30, installments: 18 },
  { id: "plan-10-50-40", name: t("Plan Inicial Bajo", "Low Down Payment"), down: 10, during: 50, delivery: 40, installments: 24 },
  { id: "plan-50-50", name: t("Plan Contado Parcial", "Partial Cash Plan"), down: 50, during: 0, delivery: 50, installments: 0 },
];

const placeholderDeveloper = {
  name: "Desarrollos del Este (ejemplo)",
  description: t(
    "Desarrollador de ejemplo. Aquí irá la trayectoria real del desarrollador, sus proyectos entregados y su enfoque de construcción.",
    "Sample developer. The real developer's track record, delivered projects and construction approach will go here."
  ),
  website: "",
};

export const seedSettings: SiteSettings = {
  id: 1,
  whatsapp_number: "18090000000",
  whatsapp_default_message: t(
    "Hola Perdomo Real Estate, me interesa recibir información sobre propiedades en Punta Cana.",
    "Hi Perdomo Real Estate, I'd like to receive information about properties in Punta Cana."
  ),
  whatsapp_project_messages: {
    [FLAGSHIP_ID]: t(
      "Hola, me interesa el proyecto 89 Villas en Macao. ¿Me pueden enviar precios y disponibilidad?",
      "Hi, I'm interested in the 89 Villas in Macao project. Could you send me prices and availability?"
    ),
  },
  email: "info@perdomorealestate.com",
  phone: "+1 809 000 0000",
  address: "Punta Cana, La Altagracia, República Dominicana",
  socials: { instagram: "https://instagram.com/", facebook: "https://facebook.com/", youtube: "https://youtube.com/" },
  hero: {
    title: t("Luxury Real Estate in Punta Cana, Dominican Republic", "Luxury Real Estate in Punta Cana, Dominican Republic"),
    subtitle: t(
      "Villas, apartamentos y terrenos seleccionados en Macao, Bávaro y Cap Cana. Asesoría bilingüe de principio a fin.",
      "Hand-picked villas, apartments and land in Macao, Bávaro and Cap Cana. Bilingual guidance from first call to closing."
    ),
  },
  exchange_rates: { DOP: 60.5, EUR: 0.92 },
  gtm_id: null,
  ga4_id: null,
  show_placeholder_labels: true,
};

export const seedProjects: Project[] = [
  {
    id: FLAGSHIP_ID,
    slug_es: "89-villas-macao",
    slug_en: "89-villas-macao",
    name: "89 Villas Macao",
    tagline: t("89 villas privadas a minutos de Playa Macao", "89 private villas minutes from Macao Beach"),
    description: t(
      "Comunidad cerrada de 89 villas contemporáneas con piscina privada, rodeada de jardines tropicales y a pocos minutos de una de las playas más vírgenes del Caribe. Tres modelos de villa, amenidades de resort y planes de pago flexibles durante la construcción.",
      "A gated community of 89 contemporary villas with private pools, surrounded by tropical gardens and just minutes from one of the Caribbean's most unspoiled beaches. Three villa models, resort-style amenities and flexible payment plans during construction."
    ),
    location_name: "Macao, Punta Cana",
    zone: "Macao",
    lat: 18.7612,
    lng: -68.5523,
    status: "preventa",
    amenities: ["pool", "gated", "security", "clubhouse", "gym", "playground", "bbq", "garden", "beach_access", "coworking"],
    timeline: [
      { phase: t("Lanzamiento y preventa", "Launch & pre-sale"), date: "2026-03-01", progress: 100 },
      { phase: t("Infraestructura y calles", "Infrastructure & roads"), date: "2026-09-01", progress: 60 },
      { phase: t("Construcción Fase 1 (villas 1–30)", "Construction Phase 1 (villas 1–30)"), date: "2027-06-01", progress: 15 },
      { phase: t("Construcción Fase 2 (villas 31–89)", "Construction Phase 2 (villas 31–89)"), date: "2028-03-01", progress: 0 },
      { phase: t("Entrega final", "Final delivery"), date: "2028-09-01", progress: 0 },
    ],
    payment_plans: standardPlans,
    documents: [
      { name: t("Brochure del proyecto", "Project brochure"), url: "" },
      { name: t("Lista de precios", "Price list"), url: "" },
      { name: t("Especificaciones técnicas", "Technical specifications"), url: "" },
      { name: t("Modelo de contrato de promesa", "Sample purchase agreement"), url: "" },
    ],
    developer: placeholderDeveloper,
    distances: [
      { label: t("Playa Macao", "Macao Beach"), value: "5 min", minutes: 5 },
      { label: t("Aeropuerto Internacional de Punta Cana", "Punta Cana International Airport"), value: "25 min", minutes: 25 },
      { label: t("Bávaro (centro)", "Bávaro (downtown)"), value: "15 min", minutes: 15 },
      { label: t("Supermercado y farmacias", "Supermarket & pharmacies"), value: "8 min", minutes: 8 },
      { label: t("Campos de golf", "Golf courses"), value: "20 min", minutes: 20 },
    ],
    price_from: 219000,
    delivery_date: "2028-09-01",
    total_units: 89,
    video_url: null,
    tour_url: null,
    brochure_url: null,
    featured: true,
    published: true,
    is_flagship: true,
    seo: {
      es: {
        title: "89 Villas en Venta en Macao, Punta Cana | Perdomo Real Estate",
        description: "Villas con piscina privada a minutos de Playa Macao. Masterplan interactivo, disponibilidad en tiempo real y planes de pago durante la construcción.",
      },
      en: {
        title: "89 Villas for Sale in Macao, Punta Cana | Perdomo Real Estate",
        description: "Private-pool villas minutes from Macao Beach. Interactive masterplan, live availability and payment plans during construction.",
      },
    },
    is_placeholder: true,
    sort: 1,
    created_at: "2026-03-01T12:00:00Z",
  },
  {
    id: ALTAMAR_ID,
    slug_es: "altamar-residences-cap-cana",
    slug_en: "altamar-residences-cap-cana",
    name: "Altamar Residences",
    tagline: t("Apartamentos frente a la marina de Cap Cana", "Apartments overlooking the Cap Cana marina"),
    description: t(
      "Edificio boutique de 48 apartamentos de 1 a 3 habitaciones con vistas a la marina, rooftop con piscina infinita y servicios de gestión de alquiler vacacional.",
      "A boutique building of 48 one- to three-bedroom apartments with marina views, an infinity-pool rooftop and vacation-rental management services."
    ),
    location_name: "Cap Cana, Punta Cana",
    zone: "Cap Cana",
    lat: 18.4865,
    lng: -68.3762,
    status: "construccion",
    amenities: ["pool", "sea_view", "gated", "security", "rooftop", "gym", "spa", "parking"],
    timeline: [
      { phase: t("Preventa", "Pre-sale"), date: "2025-06-01", progress: 100 },
      { phase: t("Estructura", "Structure"), date: "2026-08-01", progress: 100 },
      { phase: t("Terminaciones", "Finishes"), date: "2027-02-01", progress: 45 },
      { phase: t("Entrega", "Delivery"), date: "2027-06-01", progress: 0 },
    ],
    payment_plans: standardPlans.slice(0, 2),
    documents: [{ name: t("Brochure", "Brochure"), url: "" }],
    developer: placeholderDeveloper,
    distances: [
      { label: t("Marina Cap Cana", "Cap Cana Marina"), value: "2 min", minutes: 2 },
      { label: t("Playa Juanillo", "Juanillo Beach"), value: "6 min", minutes: 6 },
      { label: t("Aeropuerto", "Airport"), value: "15 min", minutes: 15 },
    ],
    price_from: 245000,
    delivery_date: "2027-06-01",
    total_units: 48,
    video_url: null,
    tour_url: null,
    brochure_url: null,
    featured: true,
    published: true,
    is_flagship: false,
    seo: {},
    is_placeholder: true,
    sort: 2,
    created_at: "2025-06-01T12:00:00Z",
  },
  {
    id: GARDEN_ID,
    slug_es: "bavaro-garden-lofts",
    slug_en: "bavaro-garden-lofts",
    name: "Bávaro Garden Lofts",
    tagline: t("Lofts listos para vivir o rentar en Bávaro", "Move-in ready lofts in Bávaro, perfect for rental"),
    description: t(
      "Residencial de 36 lofts y apartamentos con jardines interiores, piscina tipo laguna y a pasos de restaurantes, supermercados y la playa de Los Corales.",
      "A residence of 36 lofts and apartments with interior gardens, a lagoon-style pool, steps from restaurants, supermarkets and Los Corales beach."
    ),
    location_name: "Bávaro, Punta Cana",
    zone: "Bávaro",
    lat: 18.6853,
    lng: -68.4249,
    status: "listo",
    amenities: ["pool", "gated", "security", "garden", "parking", "furnished", "coworking"],
    timeline: [
      { phase: t("Construcción", "Construction"), date: "2024-01-01", progress: 100 },
      { phase: t("Entrega", "Delivery"), date: "2025-11-01", progress: 100 },
    ],
    payment_plans: [standardPlans[2]],
    documents: [{ name: t("Brochure", "Brochure"), url: "" }],
    developer: placeholderDeveloper,
    distances: [
      { label: t("Playa Los Corales", "Los Corales Beach"), value: "7 min a pie", minutes: 7 },
      { label: t("Aeropuerto", "Airport"), value: "20 min", minutes: 20 },
    ],
    price_from: 139000,
    delivery_date: "2025-11-01",
    total_units: 36,
    video_url: null,
    tour_url: null,
    brochure_url: null,
    featured: false,
    published: true,
    is_flagship: false,
    seo: {},
    is_placeholder: true,
    sort: 3,
    created_at: "2024-01-01T12:00:00Z",
  },
];

export const seedModels: VillaModel[] = [
  {
    id: uid(2, 1),
    project_id: FLAGSHIP_ID,
    code: "BRISA",
    name: "Brisa",
    bedrooms: 2,
    bathrooms: 2,
    built_m2: 135,
    lot_m2: 250,
    price_from: 219000,
    description: t(
      "Villa de una planta con cocina abierta, terraza techada y piscina privada. Ideal como segunda residencia o para alquiler vacacional.",
      "Single-level villa with open kitchen, covered terrace and private pool. Ideal as a second home or vacation rental."
    ),
    features: [t("Piscina privada", "Private pool"), t("Terraza techada", "Covered terrace"), t("Cocina abierta", "Open kitchen"), t("Parqueo para 1 vehículo", "1-car parking")],
    sort: 1,
    is_placeholder: true,
  },
  {
    id: uid(2, 2),
    project_id: FLAGSHIP_ID,
    code: "CORAL",
    name: "Coral",
    bedrooms: 3,
    bathrooms: 2.5,
    built_m2: 185,
    lot_m2: 300,
    price_from: 295000,
    description: t(
      "Villa de dos niveles con master suite en planta alta, doble altura en la sala y amplio jardín con piscina.",
      "Two-level villa with upstairs master suite, double-height living room and a generous garden with pool."
    ),
    features: [t("Doble altura", "Double-height living"), t("Master suite con walk-in", "Master suite with walk-in closet"), t("Piscina privada", "Private pool"), t("Parqueo para 2 vehículos", "2-car parking")],
    sort: 2,
    is_placeholder: true,
  },
  {
    id: uid(2, 3),
    project_id: FLAGSHIP_ID,
    code: "ARENA",
    name: "Arena",
    bedrooms: 4,
    bathrooms: 3.5,
    built_m2: 240,
    lot_m2: 380,
    price_from: 385000,
    description: t(
      "La villa insignia: cuatro habitaciones en suite, rooftop con área social y piscina con deck de madera.",
      "The signature villa: four en-suite bedrooms, rooftop lounge and pool with wooden deck."
    ),
    features: [t("Rooftop social", "Rooftop lounge"), t("4 habitaciones en suite", "4 en-suite bedrooms"), t("Cuarto de servicio", "Staff quarters"), t("Parqueo para 2 vehículos", "2-car parking")],
    sort: 3,
    is_placeholder: true,
  },
];

/** Deterministic pseudo-random statuses so the masterplan looks realistic and stable. */
function unitStatus(n: number): UnitStatus {
  const r = (n * 37 + 11) % 100;
  if (r < 16) return "sold";
  if (r < 38) return "reserved";
  return "available";
}

export const seedUnits: Unit[] = Array.from({ length: 89 }, (_, i) => {
  const n = i + 1;
  // Larger "Arena" lots on the perimeter, "Coral" in the middle ring, "Brisa" inside.
  const model = n % 5 === 0 || n > 80 ? seedModels[2] : n % 2 === 0 ? seedModels[1] : seedModels[0];
  const lotVariation = ((n * 13) % 40) - 10;
  return {
    id: uid(3, n),
    project_id: FLAGSHIP_ID,
    model_id: model.id,
    code: `V-${n.toString().padStart(2, "0")}`,
    lot_number: n,
    status: unitStatus(n),
    price: (model.price_from ?? 0) + Math.max(0, lotVariation) * 1500,
    lot_m2: model.lot_m2 + lotVariation,
    built_m2: model.built_m2,
    is_placeholder: true,
  };
});

type SeedProperty = Omit<Property, "created_at" | "seo" | "published" | "is_placeholder" | "video_url" | "tour_url"> & {
  created_at?: string;
};

const baseProps: SeedProperty[] = [
  {
    id: uid(4, 1),
    slug_es: "villa-coral-macao-v12",
    slug_en: "villa-coral-macao-v12",
    title: t("Villa Coral V-12 en 89 Villas Macao", "Villa Coral V-12 at 89 Villas Macao"),
    description: t(
      "Villa de 3 habitaciones en preventa dentro de comunidad cerrada, con piscina privada y a 5 minutos de Playa Macao.",
      "Three-bedroom pre-sale villa in a gated community, with private pool, 5 minutes from Macao Beach."
    ),
    type: "villa",
    zone: "Macao",
    project_id: FLAGSHIP_ID,
    price: 298000,
    bedrooms: 3,
    bathrooms: 2.5,
    built_m2: 185,
    lot_m2: 305,
    status: "preventa",
    amenities: ["pool", "gated", "security", "garden"],
    lat: 18.7609,
    lng: -68.5517,
    badges: ["presale", "new"],
    featured: true,
  },
  {
    id: uid(4, 2),
    slug_es: "villa-arena-macao-v85",
    slug_en: "villa-arena-macao-v85",
    title: t("Villa Arena V-85 con rooftop", "Villa Arena V-85 with rooftop"),
    description: t(
      "La villa más amplia del proyecto, en lote perimetral con más privacidad. Cuatro suites y rooftop social.",
      "The largest villa in the project, on a perimeter lot with extra privacy. Four suites and a rooftop lounge."
    ),
    type: "villa",
    zone: "Macao",
    project_id: FLAGSHIP_ID,
    price: 412000,
    bedrooms: 4,
    bathrooms: 3.5,
    built_m2: 240,
    lot_m2: 410,
    status: "preventa",
    amenities: ["pool", "gated", "security", "rooftop", "garden"],
    lat: 18.7621,
    lng: -68.5531,
    badges: ["last_units"],
    featured: true,
  },
  {
    id: uid(4, 3),
    slug_es: "apartamento-marina-cap-cana-2h",
    slug_en: "marina-apartment-cap-cana-2br",
    title: t("Apartamento de 2 habitaciones con vista a la marina", "Two-bedroom apartment with marina view"),
    description: t(
      "Apartamento en Altamar Residences con balcón hacia la marina, cocina equipada y acceso a rooftop con piscina infinita.",
      "Apartment in Altamar Residences with a marina-facing balcony, equipped kitchen and access to the infinity-pool rooftop."
    ),
    type: "apartment",
    zone: "Cap Cana",
    project_id: ALTAMAR_ID,
    price: 325000,
    bedrooms: 2,
    bathrooms: 2,
    built_m2: 112,
    lot_m2: 0,
    status: "construccion",
    amenities: ["pool", "sea_view", "gated", "rooftop", "gym"],
    lat: 18.4869,
    lng: -68.3755,
    badges: ["presale"],
    featured: true,
  },
  {
    id: uid(4, 4),
    slug_es: "penthouse-altamar-cap-cana",
    slug_en: "altamar-penthouse-cap-cana",
    title: t("Penthouse de 3 habitaciones en Altamar", "Three-bedroom penthouse at Altamar"),
    description: t(
      "Penthouse con terraza privada de 60 m², jacuzzi y vistas abiertas al mar Caribe y a la marina.",
      "Penthouse with a 60 m² private terrace, jacuzzi and open views of the Caribbean Sea and marina."
    ),
    type: "apartment",
    zone: "Cap Cana",
    project_id: ALTAMAR_ID,
    price: 589000,
    bedrooms: 3,
    bathrooms: 3.5,
    built_m2: 210,
    lot_m2: 0,
    status: "construccion",
    amenities: ["pool", "sea_view", "gated", "rooftop", "gym", "spa"],
    lat: 18.4861,
    lng: -68.3769,
    badges: ["last_units"],
    featured: true,
  },
  {
    id: uid(4, 5),
    slug_es: "loft-amueblado-bavaro",
    slug_en: "furnished-loft-bavaro",
    title: t("Loft amueblado listo para rentar en Bávaro", "Furnished rental-ready loft in Bávaro"),
    description: t(
      "Loft de 1 habitación totalmente amueblado en Bávaro Garden Lofts, a pasos de la playa de Los Corales.",
      "Fully furnished one-bedroom loft in Bávaro Garden Lofts, steps from Los Corales beach."
    ),
    type: "apartment",
    zone: "Bávaro",
    project_id: GARDEN_ID,
    price: 139000,
    bedrooms: 1,
    bathrooms: 1,
    built_m2: 58,
    lot_m2: 0,
    status: "listo",
    amenities: ["pool", "gated", "furnished", "garden"],
    lat: 18.6849,
    lng: -68.4241,
    badges: ["new"],
    featured: true,
  },
  {
    id: uid(4, 6),
    slug_es: "apartamento-los-corales-3h",
    slug_en: "los-corales-apartment-3br",
    title: t("Apartamento de 3 habitaciones en Los Corales", "Three-bedroom apartment in Los Corales"),
    description: t(
      "Apartamento familiar en planta baja con terraza y acceso directo a la piscina, en zona caminable.",
      "Ground-floor family apartment with terrace and direct pool access, in a walkable area."
    ),
    type: "apartment",
    zone: "Los Corales",
    project_id: null,
    price: 265000,
    bedrooms: 3,
    bathrooms: 2,
    built_m2: 145,
    lot_m2: 0,
    status: "listo",
    amenities: ["pool", "gated", "parking"],
    lat: 18.6881,
    lng: -68.4296,
    badges: [],
    featured: false,
  },
  {
    id: uid(4, 7),
    slug_es: "casa-familiar-vista-cana",
    slug_en: "family-house-vista-cana",
    title: t("Casa familiar en Vista Cana", "Family house in Vista Cana"),
    description: t(
      "Casa de 3 habitaciones en comunidad planificada con lagunas, colegio y club deportivo.",
      "Three-bedroom house in a master-planned community with lagoons, school and sports club."
    ),
    type: "house",
    zone: "Vista Cana",
    project_id: null,
    price: 349000,
    bedrooms: 3,
    bathrooms: 3,
    built_m2: 198,
    lot_m2: 320,
    status: "listo",
    amenities: ["pool", "gated", "security", "playground", "garden", "golf"],
    lat: 18.6442,
    lng: -68.4903,
    badges: [],
    featured: true,
  },
  {
    id: uid(4, 8),
    slug_es: "casa-cocotal-golf",
    slug_en: "cocotal-golf-house",
    title: t("Casa frente al campo de golf en Cocotal", "Golf-front house in Cocotal"),
    description: t(
      "Casa de una planta con vista al campo de golf, piscina y amplio jardín. Entregada y lista para mudarse.",
      "Single-level house overlooking the golf course, with pool and large garden. Move-in ready."
    ),
    type: "house",
    zone: "Bávaro",
    project_id: null,
    price: 465000,
    bedrooms: 4,
    bathrooms: 4,
    built_m2: 260,
    lot_m2: 600,
    status: "listo",
    amenities: ["pool", "golf", "gated", "security", "garden"],
    lat: 18.6748,
    lng: -68.4478,
    badges: ["sold"],
    featured: false,
  },
  {
    id: uid(4, 9),
    slug_es: "villa-frente-al-mar-uvero-alto",
    slug_en: "beachfront-villa-uvero-alto",
    title: t("Villa frente al mar en Uvero Alto", "Beachfront villa in Uvero Alto"),
    description: t(
      "Villa con acceso directo a la playa, 5 habitaciones y amplias terrazas. Una oportunidad poco común en la costa norte de Punta Cana.",
      "Villa with direct beach access, five bedrooms and wide terraces. A rare opportunity on Punta Cana's northern coast."
    ),
    type: "villa",
    zone: "Uvero Alto",
    project_id: null,
    price: 1250000,
    bedrooms: 5,
    bathrooms: 5.5,
    built_m2: 480,
    lot_m2: 1200,
    status: "listo",
    amenities: ["pool", "sea_view", "beach_access", "furnished", "garden", "security"],
    lat: 18.7965,
    lng: -68.5952,
    badges: ["new"],
    featured: true,
  },
  {
    id: uid(4, 10),
    slug_es: "terreno-macao-1000m2",
    slug_en: "macao-land-1000m2",
    title: t("Terreno de 1,000 m² cerca de Playa Macao", "1,000 m² lot near Macao Beach"),
    description: t(
      "Solar con título, acceso por calle asfaltada y servicios disponibles. Ideal para villa privada.",
      "Titled lot with paved road access and utilities available. Ideal for a private villa."
    ),
    type: "land",
    zone: "Macao",
    project_id: null,
    price: 95000,
    bedrooms: 0,
    bathrooms: 0,
    built_m2: 0,
    lot_m2: 1000,
    status: "listo",
    amenities: [],
    lat: 18.7568,
    lng: -68.5402,
    badges: ["new"],
    featured: false,
  },
  {
    id: uid(4, 11),
    slug_es: "terreno-comercial-bavaro",
    slug_en: "commercial-land-bavaro",
    title: t("Terreno comercial sobre avenida en Bávaro", "Commercial lot on a Bávaro avenue"),
    description: t(
      "Terreno de 2,400 m² con frente a avenida principal, uso de suelo mixto. Apto para proyecto residencial o comercial.",
      "2,400 m² lot fronting a main avenue with mixed-use zoning. Suitable for a residential or commercial project."
    ),
    type: "land",
    zone: "Bávaro",
    project_id: null,
    price: 480000,
    bedrooms: 0,
    bathrooms: 0,
    built_m2: 0,
    lot_m2: 2400,
    status: "listo",
    amenities: [],
    lat: 18.6712,
    lng: -68.4105,
    badges: [],
    featured: false,
  },
  {
    id: uid(4, 12),
    slug_es: "terreno-vista-al-mar-cap-cana",
    slug_en: "ocean-view-land-cap-cana",
    title: t("Terreno con vista al mar en Cap Cana", "Ocean-view lot in Cap Cana"),
    description: t(
      "Solar en zona alta de Cap Cana con vista al mar, dentro de comunidad cerrada con seguridad 24/7.",
      "Elevated lot in Cap Cana with ocean views, inside a gated community with 24/7 security."
    ),
    type: "land",
    zone: "Cap Cana",
    project_id: null,
    price: 310000,
    bedrooms: 0,
    bathrooms: 0,
    built_m2: 0,
    lot_m2: 1500,
    status: "listo",
    amenities: ["sea_view", "gated", "security"],
    lat: 18.4932,
    lng: -68.3871,
    badges: ["last_units"],
    featured: false,
  },
];

export const seedProperties: Property[] = baseProps.map((p, i) => ({
  ...p,
  video_url: null,
  tour_url: null,
  seo: {},
  published: true,
  is_placeholder: true,
  created_at: p.created_at ?? new Date(Date.UTC(2026, 8, 30 - i)).toISOString(),
}));

const article = (paragraphs: string[]) => paragraphs.map((p) => (p.startsWith("<") ? p : `<p>${p}</p>`)).join("\n");

// Blog topics follow the client's brief. Content is original sample copy, to be reviewed before publishing.
const post = (n: number, category: string, date: string, slugs: [string, string], title: [string, string], excerpt: [string, string], es: string[], en: string[]): Post => ({
  id: uid(5, n),
  slug_es: slugs[0],
  slug_en: slugs[1],
  title: t(...title),
  excerpt: t(...excerpt),
  content: t(article(es), article(en)),
  category,
  cover_url: null,
  author: "Perdomo Real Estate",
  published: true,
  published_at: date,
  seo: {},
  is_placeholder: true,
});

export const seedPosts: Post[] = [
  post(
    1,
    "guias",
    "2026-10-01T10:00:00Z",
    ["comprar-propiedad-en-punta-cana-guia-practica", "buying-property-in-punta-cana-practical-guide"],
    ["Comprar una propiedad en Punta Cana: guía práctica", "Buying Property in Punta Cana: A Practical Guide"],
    [
      "Del primer presupuesto a la entrega de llaves: los pasos reales para comprar con seguridad en Punta Cana. Artículo de ejemplo.",
      "From your first budget to getting the keys: the real steps to buy safely in Punta Cana. Sample article.",
    ],
    [
      "Artículo de ejemplo. El contenido definitivo será revisado por el equipo de Perdomo Real Estate y un abogado local.",
      "<h2>1. Define para qué compras</h2>",
      "Vivir, pasar temporadas o rentar: cada objetivo cambia la zona ideal, el tipo de propiedad y el presupuesto. Una villa para alquiler vacacional se evalúa distinto a una casa para vivir todo el año.",
      "<h2>2. Fija un presupuesto completo</h2>",
      "Además del precio, considera impuestos de transferencia (si aplican), honorarios legales, mobiliario, cuota de mantenimiento e impuesto anual a la propiedad.",
      "<h2>3. Elige zona y proyecto</h2>",
      "Macao, Bávaro y Cap Cana tienen perfiles muy distintos en precio, ambiente y potencial de renta. Visita, presencial o virtualmente, antes de decidir.",
      "<h2>4. Revisión legal independiente</h2>",
      "Un abogado de tu confianza debe verificar el título, los permisos del proyecto y el contrato antes de firmar o pagar.",
      "<h2>5. Reserva, contrato y pagos</h2>",
      "En proyectos en construcción se firma un contrato de promesa con un calendario de pagos. En propiedades listas, el cierre suele ser más rápido.",
      "<h2>6. Entrega y título</h2>",
      "Al recibir la propiedad se firma el contrato definitivo y se inscribe el título a tu nombre.",
    ],
    [
      "Sample article. The final content will be reviewed by the Perdomo Real Estate team and a local attorney.",
      "<h2>1. Decide why you are buying</h2>",
      "Living, seasonal stays or renting out: each goal changes the right area, property type and budget. A vacation-rental villa is evaluated differently from a year-round home.",
      "<h2>2. Set a complete budget</h2>",
      "Beyond the price, account for transfer tax (if applicable), legal fees, furniture, HOA fees and the annual property tax.",
      "<h2>3. Choose the area and project</h2>",
      "Macao, Bávaro and Cap Cana differ widely in price, atmosphere and rental potential. Visit — in person or virtually — before deciding.",
      "<h2>4. Independent legal review</h2>",
      "An attorney you trust should verify the title, the project's permits and the contract before you sign or pay.",
      "<h2>5. Reservation, contract and payments</h2>",
      "Off-plan projects use a promise-to-sell agreement with a payment schedule. Ready properties usually close faster.",
      "<h2>6. Delivery and title</h2>",
      "On delivery you sign the final deed and the title is registered in your name.",
    ]
  ),
  post(
    2,
    "zonas",
    "2026-09-24T10:00:00Z",
    ["villas-en-venta-en-macao-punta-cana", "villas-for-sale-in-macao-punta-cana"],
    ["Villas en venta en Macao, Punta Cana: lo que debes saber", "Villas for Sale in Macao, Punta Cana"],
    [
      "Por qué Macao atrae a compradores de villas, qué tipos de proyectos hay y qué revisar antes de reservar. Artículo de ejemplo.",
      "Why Macao attracts villa buyers, what kinds of projects exist and what to check before reserving. Sample article.",
    ],
    [
      "Artículo de ejemplo.",
      "<h2>Una zona con carácter propio</h2>",
      "Macao combina una de las playas más naturales de Punta Cana con un desarrollo de baja densidad, a pocos minutos de Bávaro y del aeropuerto.",
      "<h2>Qué tipo de villas encontrarás</h2>",
      "Predominan las comunidades cerradas de villas de 2 a 4 habitaciones con piscina privada, muchas en etapa de preventa con planes de pago durante la construcción.",
      "<h2>Qué revisar antes de reservar</h2>",
      "<ul><li>Permisos y licencias del proyecto.</li><li>Calendario de obra y fecha de entrega.</li><li>Reglamento sobre alquiler vacacional.</li><li>Cuota de mantenimiento estimada.</li></ul>",
    ],
    [
      "Sample article.",
      "<h2>An area with its own character</h2>",
      "Macao pairs one of Punta Cana's most natural beaches with low-density development, minutes from Bávaro and the airport.",
      "<h2>What kind of villas you'll find</h2>",
      "Gated communities of 2- to 4-bedroom villas with private pools dominate, many in pre-sale with payment plans during construction.",
      "<h2>What to check before reserving</h2>",
      "<ul><li>Project permits and licences.</li><li>Construction schedule and delivery date.</li><li>Vacation-rental rules.</li><li>Estimated HOA fees.</li></ul>",
    ]
  ),
  post(
    3,
    "legal",
    "2026-09-15T10:00:00Z",
    ["que-revisar-antes-de-comprar-una-propiedad-en-republica-dominicana", "what-to-consider-before-buying-property-in-the-dominican-republic"],
    ["Qué revisar antes de comprar una propiedad en República Dominicana", "What to Consider Before Buying Property in the Dominican Republic"],
    [
      "Título, permisos, costos y contrato: la lista que conviene repasar con tu abogado. Artículo de ejemplo.",
      "Title, permits, costs and contract: the checklist to review with your attorney. Sample article.",
    ],
    [
      "Artículo de ejemplo. No constituye asesoría legal.",
      "<h2>El título de propiedad</h2>",
      "Confirma que el vendedor o desarrollador es el titular, que el terreno está deslindado y que no tiene cargas ni gravámenes.",
      "<h2>Permisos del proyecto</h2>",
      "Licencia de construcción, permisos ambientales y, si aplica, aprobaciones turísticas.",
      "<h2>Costos totales</h2>",
      "Impuesto de transferencia, honorarios, gastos de registro, mantenimiento e impuesto anual.",
      "<h2>El contrato</h2>",
      "Revisa penalidades por retraso, condiciones de devolución y qué incluye exactamente la entrega.",
    ],
    [
      "Sample article. This is not legal advice.",
      "<h2>The title</h2>",
      "Confirm the seller or developer holds the title, that the land is surveyed and free of liens.",
      "<h2>Project permits</h2>",
      "Construction licence, environmental permits and, where relevant, tourism approvals.",
      "<h2>Total costs</h2>",
      "Transfer tax, fees, registry costs, HOA fees and the annual property tax.",
      "<h2>The contract</h2>",
      "Check delay penalties, refund conditions and exactly what the delivery includes.",
    ]
  ),
  post(
    4,
    "guias",
    "2026-09-05T10:00:00Z",
    ["comprar-un-apartamento-en-punta-cana", "buying-an-apartment-in-punta-cana"],
    ["Comprar un apartamento en Punta Cana", "Buying an Apartment in Punta Cana"],
    [
      "Ubicación, amenidades, cuota de mantenimiento y potencial de renta: cómo comparar apartamentos. Artículo de ejemplo.",
      "Location, amenities, HOA fees and rental potential: how to compare apartments. Sample article.",
    ],
    [
      "Artículo de ejemplo.",
      "<h2>Ubicación primero</h2>",
      "La distancia a la playa, a servicios y al aeropuerto influye tanto en tu día a día como en la demanda de alquiler.",
      "<h2>Amenidades que sí importan</h2>",
      "Piscina, seguridad, parqueo y, si piensas rentar, gestión profesional en el propio edificio.",
      "<h2>Costos recurrentes</h2>",
      "Pregunta por la cuota de mantenimiento y qué cubre. Una cuota baja puede significar menos servicios.",
    ],
    [
      "Sample article.",
      "<h2>Location first</h2>",
      "Distance to the beach, services and the airport shapes both daily life and rental demand.",
      "<h2>Amenities that matter</h2>",
      "Pool, security, parking and, if you plan to rent, professional on-site management.",
      "<h2>Recurring costs</h2>",
      "Ask about HOA fees and what they cover. A low fee can mean fewer services.",
    ]
  ),
  post(
    5,
    "inversion",
    "2026-08-25T10:00:00Z",
    ["preguntas-antes-de-comprar-una-villa-nueva", "questions-to-ask-before-purchasing-a-new-villa"],
    ["Preguntas que debes hacer antes de comprar una villa nueva", "Questions to Ask Before Purchasing a New Villa"],
    [
      "Diez preguntas para el desarrollador antes de firmar una reserva. Artículo de ejemplo.",
      "Ten questions for the developer before you sign a reservation. Sample article.",
    ],
    [
      "Artículo de ejemplo.",
      "<ol><li>¿Qué proyectos ha entregado el desarrollador?</li><li>¿Qué permisos tiene el proyecto hoy?</li><li>¿Cuál es la fecha de entrega y qué pasa si se retrasa?</li><li>¿Qué acabados incluye el precio?</li><li>¿Se permite el alquiler vacacional?</li><li>¿Cuál será la cuota de mantenimiento?</li><li>¿Cómo se ejecutan los pagos?</li><li>¿Qué garantías ofrece la construcción?</li><li>¿Puedo personalizar la villa?</li><li>¿Quién administra la comunidad?</li></ol>",
    ],
    [
      "Sample article.",
      "<ol><li>What projects has the developer delivered?</li><li>What permits does the project hold today?</li><li>What is the delivery date and what happens if it slips?</li><li>Which finishes are included in the price?</li><li>Is vacation rental allowed?</li><li>What will the HOA fee be?</li><li>How are payments handled?</li><li>What construction warranties apply?</li><li>Can I customise the villa?</li><li>Who manages the community?</li></ol>",
    ]
  ),
  post(
    6,
    "guias",
    "2026-08-12T10:00:00Z",
    ["guia-para-comprar-una-villa-en-punta-cana", "how-to-buy-a-villa-in-punta-cana"],
    ["Guía para comprar una villa en Punta Cana", "How to Buy a Villa in Punta Cana"],
    [
      "Modelos, terreno, piscina y plan de pago: cómo elegir la villa adecuada. Artículo de ejemplo.",
      "Models, lot size, pool and payment plan: how to choose the right villa. Sample article.",
    ],
    [
      "Artículo de ejemplo.",
      "<h2>Elige el modelo por uso real</h2>",
      "Piensa en cuántas personas usarán la villa y si la rentarás: a veces una habitación extra aumenta mucho el potencial de alquiler.",
      "<h2>El lote importa</h2>",
      "Orientación, privacidad y metros de terreno marcan la diferencia en el día a día y en el valor futuro.",
      "<h2>Compara planes de pago</h2>",
      "Un inicial más bajo da flexibilidad, pero revisa el saldo contra entrega y cómo lo financiarás.",
    ],
    [
      "Sample article.",
      "<h2>Pick the model for real use</h2>",
      "Think about how many people will use the villa and whether you'll rent it: an extra bedroom can greatly increase rental potential.",
      "<h2>The lot matters</h2>",
      "Orientation, privacy and lot size make a difference day to day and in future value.",
      "<h2>Compare payment plans</h2>",
      "A lower down payment gives flexibility, but check the balance due on delivery and how you'll fund it.",
    ]
  ),
];


const faq = (n: number, project_id: string | null, q: [string, string], a: [string, string]): Faq => ({
  id: uid(6, n),
  project_id,
  question: t(...q),
  answer: t(...a),
  sort: n,
  published: true,
  is_placeholder: true,
});

export const seedFaqs: Faq[] = [
  faq(1, null, ["¿Puede un extranjero comprar propiedad en República Dominicana?", "Can a foreigner buy property in the Dominican Republic?"], ["Sí. La ley dominicana permite a extranjeros adquirir propiedades con los mismos derechos que un ciudadano local. Respuesta de ejemplo.", "Yes. Dominican law allows foreigners to own property with the same rights as local citizens. Sample answer."]),
  faq(2, null, ["¿Necesito viajar para comprar?", "Do I need to travel to buy?"], ["No necesariamente. Ofrecemos visitas virtuales y el proceso puede completarse con poder notarial. Respuesta de ejemplo.", "Not necessarily. We offer virtual tours and the process can be completed with a power of attorney. Sample answer."]),
  faq(3, null, ["¿Ofrecen financiamiento?", "Do you offer financing?"], ["Los proyectos en planos tienen planes de pago directos con el desarrollador. Para propiedades listas podemos referirte a bancos locales. Respuesta de ejemplo.", "Off-plan projects have direct payment plans with the developer. For ready properties we can refer you to local banks. Sample answer."]),
  faq(4, null, ["¿En qué moneda se pagan las propiedades?", "In which currency are properties paid?"], ["La mayoría de los proyectos turísticos se cotizan en dólares estadounidenses (USD). Respuesta de ejemplo.", "Most tourism projects are priced in US dollars (USD). Sample answer."]),
  faq(5, null, ["¿Puedo rentar mi propiedad en plataformas de alquiler vacacional?", "Can I rent my property on vacation-rental platforms?"], ["Depende del reglamento de cada proyecto. Te indicamos cuáles lo permiten. Respuesta de ejemplo.", "It depends on each project's rules. We'll tell you which ones allow it. Sample answer."]),
  faq(6, null, ["¿Qué costos adicionales debo considerar?", "What additional costs should I consider?"], ["Impuesto de transferencia (si aplica), honorarios legales, cuota de mantenimiento e IPI anual. Respuesta de ejemplo.", "Transfer tax (if applicable), legal fees, HOA fees and annual property tax. Sample answer."]),
  faq(7, FLAGSHIP_ID, ["¿Cuándo se entregan las villas?", "When will the villas be delivered?"], ["La entrega está planificada por fases: Fase 1 en 2027 y Fase 2 en 2028. Fechas de ejemplo.", "Delivery is planned in phases: Phase 1 in 2027 and Phase 2 in 2028. Sample dates."]),
  faq(8, FLAGSHIP_ID, ["¿Puedo reservar una villa a distancia?", "Can I reserve a villa remotely?"], ["Sí, la reserva se puede hacer en línea con un depósito y firma digital. Respuesta de ejemplo.", "Yes, you can reserve online with a deposit and digital signature. Sample answer."]),
  faq(9, FLAGSHIP_ID, ["¿Las villas incluyen piscina?", "Do the villas include a pool?"], ["Todos los modelos incluyen piscina privada. Respuesta de ejemplo.", "All models include a private pool. Sample answer."]),
  faq(10, FLAGSHIP_ID, ["¿Cuál es la cuota de mantenimiento estimada?", "What is the estimated HOA fee?"], ["Se informará con el reglamento final del condominio. Respuesta de ejemplo.", "It will be confirmed with the final condominium rules. Sample answer."]),
  faq(11, FLAGSHIP_ID, ["¿Se permite el alquiler vacacional?", "Is vacation rental allowed?"], ["Sí, el reglamento contempla el alquiler a corto plazo. Respuesta de ejemplo.", "Yes, the rules allow short-term rentals. Sample answer."]),
  faq(12, FLAGSHIP_ID, ["¿Puedo personalizar los acabados?", "Can I customize the finishes?"], ["Hay paquetes de acabados opcionales disponibles hasta cierta etapa de obra. Respuesta de ejemplo.", "Optional finish packages are available up to a certain construction stage. Sample answer."]),
];
