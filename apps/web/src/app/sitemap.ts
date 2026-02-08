import type { MetadataRoute } from "next";
import { HOME_DOMAIN } from "@repo/utils";
import { hymns } from "@/content/hymns";
import { getDevotionalDates } from "@/lib/devotionals";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const devotionalDates = await getDevotionalDates();

  return [
    {
      url: HOME_DOMAIN,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${HOME_DOMAIN}/bible`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...devotionalDates.map((date) => ({
      url: `${HOME_DOMAIN}/${date}`,
      lastModified: new Date(date),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    {
      url: `${HOME_DOMAIN}/hymns`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    ...hymns.map((hymn) => ({
      url: `${HOME_DOMAIN}/hymns/${hymn.id}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
