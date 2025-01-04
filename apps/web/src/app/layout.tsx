import { cn } from "@repo/ui/utils";
import { constructMetadata } from "@repo/utils";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@repo/ui/styles.css";
import "./globals.css";

import type { JSX } from "react";
import RootProviders from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = constructMetadata();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          inter.className,
          "min-h-screen bg-background font-sans antialiased",
        )}
      >
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
  );
}
