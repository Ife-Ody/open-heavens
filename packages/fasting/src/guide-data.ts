import guide from "./2026-prayer-guide.json";
import type { PrayerGuideDay, PrayerGuideDocument } from "./types";

const prayerGuideData = guide as PrayerGuideDocument;

export function getPrayerGuide(): PrayerGuideDocument {
  return prayerGuideData;
}

export function getPrayerGuideDays(): PrayerGuideDay[] {
  return prayerGuideData.days;
}

export function getPrayerGuideDay(day: number): PrayerGuideDay | undefined {
  return prayerGuideData.days.find((entry) => entry.day === day);
}
