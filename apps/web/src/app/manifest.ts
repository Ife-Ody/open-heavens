import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Open Heavens Devotional",
    short_name: "Open Heavens",
    description:
      "Open Heavens Devotional is the free open heavens devotional app by Pastor E.A. Adeboye",
    start_url: "/",
    icons: [
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    theme_color: "#F09642",
    background_color: "#F09642",
    display: "standalone",
  };
}
