import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/env";

/** All commercial pages are crawlable; only the admin panel and API are blocked. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
