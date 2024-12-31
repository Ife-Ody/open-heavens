import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@repo/ui/utils";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SettingsProvider } from "./context/settings-context";
import "./globals.css";
import '../styles/bible-reference.css';

import type { JSX } from "react";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RCCG Open Heavens Reader",
  description: "A simple reader for the Open Heavens devotional",
};

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
