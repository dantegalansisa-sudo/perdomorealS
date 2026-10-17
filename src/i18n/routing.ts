import { defineRouting } from "next-intl/routing";

export const locales = ["es", "en"] as const;
export type Locale = (typeof locales)[number];

/**
 * Internal route → public, translated slug per locale.
 * Folder names under src/app/[locale] use the internal key.
 */
export const routing = defineRouting({
  locales,
  defaultLocale: "es",
  localePrefix: "always",
  // hreflang is emitted per page in <head> (it knows translated entity slugs); no Link headers.
  alternateLinks: false,
  pathnames: {
    "/": "/",
    "/villas-macao": {
      es: "/villas-en-venta-macao-punta-cana",
      en: "/villas-for-sale-macao-punta-cana",
    },
    "/apartments": {
      es: "/apartamentos-en-venta-punta-cana",
      en: "/apartments-for-sale-punta-cana",
    },
    "/villas": { es: "/villas-en-venta-punta-cana", en: "/villas-for-sale-punta-cana" },
    "/houses": { es: "/casas-en-venta-punta-cana", en: "/houses-for-sale-punta-cana" },
    "/land": { es: "/terrenos-en-venta-punta-cana", en: "/land-for-sale-punta-cana" },
    "/projects": {
      es: "/proyectos-inmobiliarios-punta-cana",
      en: "/real-estate-projects-punta-cana",
    },
    "/projects/[slug]": { es: "/proyectos/[slug]", en: "/projects/[slug]" },
    "/properties": { es: "/propiedades", en: "/properties" },
    "/properties/[slug]": { es: "/propiedades/[slug]", en: "/properties/[slug]" },
    "/about": { es: "/sobre-nosotros", en: "/about-us" },
    "/contact": { es: "/contacto", en: "/contact" },
    "/blog": "/blog",
    "/blog/[slug]": "/blog/[slug]",
    "/favorites": { es: "/favoritos", en: "/favorites" },
    "/compare": { es: "/comparar", en: "/compare" },
    "/legal/privacy": { es: "/politica-de-privacidad", en: "/privacy-policy" },
    "/legal/cookies": { es: "/politica-de-cookies", en: "/cookie-policy" },
    "/legal/terms": { es: "/terminos-y-condiciones", en: "/terms-and-conditions" },
    "/legal/disclaimer": {
      es: "/aviso-informacion-propiedades",
      en: "/property-information-notice",
    },
  },
});

export type AppPathname = keyof typeof routing.pathnames;
export type StaticPathname = Exclude<AppPathname, `${string}[${string}]${string}`>;
