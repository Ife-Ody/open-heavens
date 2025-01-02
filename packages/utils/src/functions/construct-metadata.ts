import { type Metadata } from "next";
import { HOME_DOMAIN } from "../constants";

export function constructMetadata({
  title = `${process.env.NEXT_PUBLIC_APP_NAME} - Open Heavens Devotional`,
  description = `${process.env.NEXT_PUBLIC_APP_NAME} is the free open heavens devotional app by Pastor E.A. Adeboye`,
  image = "https://files.openheavens.app/thumbnail.png",
  video,
  icons = [
    {
      rel: "apple-touch-icon",
      sizes: "32x32",
      url: "https://files.openheavens.app/thumb-logo-base-32x32.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      url: "https://files.openheavens.app/thumb-logo-base-32x32.png",
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
    description,
    openGraph: {
      title,
      description,
      ...(image && {
        images: image,
      }),
      ...(video && {
        videos: video,
      }),
    },
    twitter: {
      title,
      description,
      ...(image && {
        card: "summary_large_image",
        images: [image],
      }),
      ...(video && {
        player: video,
      }),
      creator: "@ife_Ody",
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
  };
}
