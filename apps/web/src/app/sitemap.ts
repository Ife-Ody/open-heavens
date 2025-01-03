import type { MetadataRoute } from "next";
import { HOME_DOMAIN } from "@repo/utils";
import { posts } from "./content/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: HOME_DOMAIN,
      lastModified: new Date(),
      changeFrequency: "yearly",
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
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}
