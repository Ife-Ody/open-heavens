import type { MetadataRoute } from "next";
import { HOME_DOMAIN } from "@repo/utils";
import { posts } from "./content/posts";
import { hymns } from "./content/hymns";

export default function sitemap(): MetadataRoute.Sitemap {
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
    ...posts.map((post) => ({
      url: `${HOME_DOMAIN}/${post.date}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    ...hymns.map((hymn) => ({
      url: `${HOME_DOMAIN}/hymns/${hymn.id}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
