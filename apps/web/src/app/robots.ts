import { HOME_DOMAIN } from "@repo/utils";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/private/",
    },
    sitemap: `${HOME_DOMAIN}/sitemap.xml`,
    host: HOME_DOMAIN,
  };
}
