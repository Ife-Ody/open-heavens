import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@repo/ui/utils";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/bible-reference.css";
import { SettingsProvider } from "./context/settings-context";
import "@repo/ui/styles.css";
import "./globals.css";
import { constructMetadata } from "@repo/utils";

import type { JSX } from "react";

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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          storageKey="ortheme"
          enableSystem
          disableTransitionOnChange
        >
          <SettingsProvider>{children}</SettingsProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
