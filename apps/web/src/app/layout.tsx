import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { Footer } from "@/components/layout/footer";
import { GoogleAnalytics } from "@next/third-parties/google";
import { cn } from "@repo/ui/lib/utils";
import { constructMetadata } from "@repo/utils";
import RootProviders from "./providers";
import "@repo/ui/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = constructMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="apple-mobile-web-app-title"
          content="Open Heavens Devotional"
        />
      </head>
      <body
        className={cn(
          inter.className,
          "min-h-screen bg-background font-sans antialiased",
        )}
      >
        <RootProviders>{children}</RootProviders>
        <GoogleAnalytics gaId="GTM-TKGWSF3F" />
        <Footer />
      </body>
    </html>
  );
}
