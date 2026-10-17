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
    title: t("LUXURY REAL ESTATE IN PUNTA CANA", "LUXURY REAL ESTATE IN PUNTA CANA"),
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

export const seedPosts: Post[] = [
  {
    id: uid(5, 1),
    slug_es: "como-comprar-propiedad-en-republica-dominicana-siendo-extranjero",
    slug_en: "how-to-buy-property-in-the-dominican-republic-as-a-foreigner",
    title: t("Cómo comprar una propiedad en República Dominicana siendo extranjero", "How to buy property in the Dominican Republic as a foreigner"),
    excerpt: t(
      "Guía paso a paso: documentos, debida diligencia, contrato de promesa y cierre. Artículo de ejemplo.",
      "A step-by-step guide: documents, due diligence, purchase agreement and closing. Sample article."
    ),
    content: t(
      article([
        "Este es un artículo de ejemplo. El contenido real será redactado y revisado por el equipo de Perdomo Real Estate junto a un abogado local.",
        "<h2>1. Define tu objetivo</h2>",
        "Antes de visitar propiedades, define si buscas una segunda residencia, una inversión para alquiler o un lugar para vivir.",
        "<h2>2. Debida diligencia</h2>",
        "Un abogado independiente verifica el título, los impuestos al día y los permisos del proyecto.",
        "<h2>3. Contrato y pagos</h2>",
        "En proyectos en planos se firma un contrato de promesa de compraventa con un calendario de pagos ligado al avance de obra.",
        "<h2>4. Cierre y título</h2>",
        "Al entregar la propiedad se firma el contrato definitivo y se transfiere el título a tu nombre.",
      ]),
      article([
        "This is a sample article. The real content will be written and reviewed by the Perdomo Real Estate team together with a local attorney.",
        "<h2>1. Define your goal</h2>",
        "Before touring properties, decide whether you want a second home, a rental investment or a place to live.",
        "<h2>2. Due diligence</h2>",
        "An independent attorney verifies the title, that taxes are paid and the project's permits.",
        "<h2>3. Agreement and payments</h2>",
        "For off-plan projects you sign a promise-to-sell agreement with a payment schedule tied to construction progress.",
        "<h2>4. Closing and title</h2>",
        "On delivery you sign the final deed and the title is transferred to your name.",
      ])
    ),
    category: "guias",
    cover_url: null,
    author: "Perdomo Real Estate",
    published: true,
    published_at: "2026-10-01T10:00:00Z",
    seo: {},
    is_placeholder: true,
  },
  {
    id: uid(5, 2),
    slug_es: "playa-macao-guia-completa",
    slug_en: "macao-beach-complete-guide",
    title: t("Playa Macao: la guía completa de la zona con más proyección de Punta Cana", "Macao Beach: a complete guide to Punta Cana's up-and-coming area"),
    excerpt: t("Qué hace especial a Macao, cómo llegar y por qué atrae a compradores e inversionistas. Artículo de ejemplo.", "What makes Macao special, how to get there and why it attracts buyers and investors. Sample article."),
    content: t(
      article(["Artículo de ejemplo sobre Playa Macao.", "<h2>Una playa protegida</h2>", "Macao es conocida por su arena dorada y su entorno natural poco desarrollado.", "<h2>Conectividad</h2>", "La zona se conecta con Bávaro y el aeropuerto por la autovía del Coral."]),
      article(["Sample article about Macao Beach.", "<h2>A protected beach</h2>", "Macao is known for its golden sand and low-density natural surroundings.", "<h2>Connectivity</h2>", "The area connects to Bávaro and the airport via the Coral highway."])
    ),
    category: "zonas",
    cover_url: null,
    author: "Perdomo Real Estate",
    published: true,
    published_at: "2026-09-20T10:00:00Z",
    seo: {},
    is_placeholder: true,
  },
  {
    id: uid(5, 3),
    slug_es: "planes-de-pago-en-planos-explicados",
    slug_en: "off-plan-payment-plans-explained",
    title: t("Planes de pago en planos: cómo funcionan el inicial, las cuotas y el saldo contra entrega", "Off-plan payment plans: how down payment, installments and balance on delivery work"),
    excerpt: t("Entiende cada etapa del pago al comprar en preventa. Artículo de ejemplo.", "Understand each payment stage when buying pre-construction. Sample article."),
    content: t(
      article(["Artículo de ejemplo.", "<h2>El inicial</h2>", "Normalmente entre 10% y 30% al firmar.", "<h2>Cuotas durante la construcción</h2>", "Pagos mensuales o por hitos de obra.", "<h2>Saldo contra entrega</h2>", "Se paga al recibir la propiedad, con fondos propios o financiamiento."]),
      article(["Sample article.", "<h2>The down payment</h2>", "Typically between 10% and 30% at signing.", "<h2>Installments during construction</h2>", "Monthly payments or construction milestones.", "<h2>Balance on delivery</h2>", "Paid when you receive the property, with your own funds or financing."])
    ),
    category: "inversion",
    cover_url: null,
    author: "Perdomo Real Estate",
    published: true,
    published_at: "2026-09-10T10:00:00Z",
    seo: {},
    is_placeholder: true,
  },
  {
    id: uid(5, 4),
    slug_es: "rentabilidad-alquiler-vacacional-punta-cana",
    slug_en: "vacation-rental-returns-punta-cana",
    title: t("¿Cuánto puede rentar una villa en Punta Cana? Variables que debes conocer", "How much can a villa earn in Punta Cana? Variables you should know"),
    excerpt: t("Ocupación, tarifa diaria, gastos de gestión y mantenimiento. Artículo de ejemplo.", "Occupancy, nightly rate, management and maintenance costs. Sample article."),
    content: t(
      article(["Artículo de ejemplo. Las cifras de rentabilidad siempre son estimaciones.", "<h2>Ocupación</h2>", "Depende de la temporada, la ubicación y la gestión.", "<h2>Gastos</h2>", "Considera administración, limpieza, mantenimiento, servicios e impuestos."]),
      article(["Sample article. Return figures are always estimates.", "<h2>Occupancy</h2>", "Depends on season, location and management.", "<h2>Costs</h2>", "Account for management, cleaning, maintenance, utilities and taxes."])
    ),
    category: "inversion",
    cover_url: null,
    author: "Perdomo Real Estate",
    published: true,
    published_at: "2026-08-28T10:00:00Z",
    seo: {},
    is_placeholder: true,
  },
  {
    id: uid(5, 5),
    slug_es: "ley-confotur-beneficios-fiscales",
    slug_en: "confotur-law-tax-benefits",
    title: t("Ley CONFOTUR: qué es y cómo puede beneficiar tu compra", "CONFOTUR law: what it is and how it can benefit your purchase"),
    excerpt: t("Resumen general de los incentivos turísticos. Verifica siempre con un abogado. Artículo de ejemplo.", "An overview of tourism incentives. Always verify with an attorney. Sample article."),
    content: t(
      article(["Artículo de ejemplo. No constituye asesoría legal ni fiscal.", "<h2>¿Qué es?</h2>", "Un régimen de incentivos para proyectos turísticos aprobados.", "<h2>Verificación</h2>", "Confirma con un abogado si el proyecto específico está aprobado."]),
      article(["Sample article. This is not legal or tax advice.", "<h2>What is it?</h2>", "An incentive framework for approved tourism projects.", "<h2>Verification</h2>", "Confirm with an attorney whether the specific project is approved."])
    ),
    category: "legal",
    cover_url: null,
    author: "Perdomo Real Estate",
    published: true,
    published_at: "2026-08-15T10:00:00Z",
    seo: {},
    is_placeholder: true,
  },
  {
    id: uid(5, 6),
    slug_es: "costos-de-cierre-al-comprar-en-punta-cana",
    slug_en: "closing-costs-when-buying-in-punta-cana",
    title: t("Costos de cierre al comprar en Punta Cana: lo que nadie te cuenta", "Closing costs when buying in Punta Cana: what nobody tells you"),
    excerpt: t("Impuesto de transferencia, honorarios legales y otros gastos. Artículo de ejemplo.", "Transfer tax, legal fees and other expenses. Sample article."),
    content: t(
      article(["Artículo de ejemplo.", "<h2>Impuestos</h2>", "El impuesto de transferencia aplica sobre el valor de la propiedad salvo exenciones.", "<h2>Honorarios</h2>", "Incluye abogado, notario y registro."]),
      article(["Sample article.", "<h2>Taxes</h2>", "Transfer tax applies to the property value unless exempt.", "<h2>Fees</h2>", "Includes attorney, notary and registry."])
    ),
    category: "guias",
    cover_url: null,
    author: "Perdomo Real Estate",
    published: true,
    published_at: "2026-08-01T10:00:00Z",
    seo: {},
    is_placeholder: true,
  },
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
