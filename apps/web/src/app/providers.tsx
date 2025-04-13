"use client";
import PostHogPageView from "@/components/layout/posthog-pageview";
import { Toaster } from "@repo/ui/components/sonner";
import { ThemeProvider } from "next-themes";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { ReactNode, useEffect } from "react";
import { BibleProvider } from "./context/bible-context";
import { SettingsProvider } from "./context/settings-context";
if (typeof window !== "undefined") {
}

export default function RootProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: "/_proxy/posthog/ingest",
      ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
      person_profiles: "identified_only",
      capture_pageview: false, // Disable automatic pageview capture, as we capture manually
      capture_pageleave: true, // Enable pageleave capture
    });
  }, []);
  return (
    <PostHogProvider client={posthog}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        storageKey="ortheme"
        enableSystem
        disableTransitionOnChange
      >
        <PostHogPageView />
        <Toaster />
        {/* <TooltipProvider> */}
        <SettingsProvider>
          <BibleProvider>{children}</BibleProvider>
        </SettingsProvider>
        {/* </TooltipProvider> */}
      </ThemeProvider>
    </PostHogProvider>
  );
}
