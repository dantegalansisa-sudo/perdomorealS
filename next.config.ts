import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "placeholder.supabase.co";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }],
  },
  experimental: {
    serverActions: { bodySizeLimit: "12mb" },
  },
  // Stable URLs: add legacy → new mappings here when the old site is replaced.
  async redirects() {
    return [
      { source: "/villas-macao", destination: "/es/villas-en-venta-macao-punta-cana", permanent: true },
      { source: "/en/villas", destination: "/en/villas-for-sale-punta-cana", permanent: true },
      { source: "/es/villas", destination: "/es/villas-en-venta-punta-cana", permanent: true },
      { source: "/en/projects", destination: "/en/real-estate-projects-punta-cana", permanent: true },
      { source: "/es/proyectos", destination: "/es/proyectos-inmobiliarios-punta-cana", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
