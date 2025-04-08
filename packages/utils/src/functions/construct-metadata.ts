import { type Metadata } from "next";
import { HOME_DOMAIN } from "../constants";
import { truncate } from "./truncate";

export function constructMetadata({
  title = `${process.env.NEXT_PUBLIC_APP_NAME} - Open Heavens Devotional`,
  description = `${process.env.NEXT_PUBLIC_APP_NAME} is the free open heavens devotional app by Pastor E.A. Adeboye`,
  image = "https://ol1k8fnyetvuk6ie.public.blob.vercel-storage.com/thumbnail.png",
  video,
  icons = [
    {
      rel: "apple-touch-icon",
      sizes: "32x32",
      url: "https://ol1k8fnyetvuk6ie.public.blob.vercel-storage.com/logo-base-32x32.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      url: "https://ol1k8fnyetvuk6ie.public.blob.vercel-storage.com/logo-base-32x32.png",
    },
  ],
  canonicalUrl,
  noIndex = false,
}: {
  title?: string;
  description?: string;
  image?: string | null;
  video?: string | null;
  icons?: Metadata["icons"];
  canonicalUrl?: string;
  noIndex?: boolean;
} = {}): Metadata {
  return {
    title,
    description: truncate(description, 157),
    openGraph: {
      title,
      description: truncate(description, 157)!,
      ...(image && {
        images: image,
      }),
      ...(video && {
        videos: video,
      }),
      url: new URL(HOME_DOMAIN),
    },
    twitter: {
      title,
      description: truncate(description, 157)!,
      ...(image && {
        card: "summary_large_image",
        images: [image],
      }),
      ...(video && {
        player: video,
      }),
      creator: "@Ife_Ody",
    },
    icons,
    metadataBase: new URL(HOME_DOMAIN),
    ...(canonicalUrl && {
      alternates: {
        canonical: canonicalUrl,
      },
    }),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}
