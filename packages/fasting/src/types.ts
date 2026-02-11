export type FastingType = "dry" | "water" | "partial";

export interface FastingPlan {
  name: string;
  durationDays: number;
  type: FastingType;
}

export type PrayerGuideSection =
  | "PRAYER_POINTS"
  | "ACTION_POINTS"
  | "UNKNOWN";

export interface PrayerPoint {
  index: number;
  text: string;
}

export interface PrayerGuideDay {
  day: number;
  page: number;
  date: string;
  section: PrayerGuideSection;
  prayerFocus?: string;
  introduction?: string;
  anchorScripture?: string[];
  points: PrayerPoint[];
}

export interface PrayerGuideDocument {
  sourceFile: string;
  totalPages: number;
  startPage: number;
  totalDays: number;
  startDate: string;
  days: PrayerGuideDay[];
}

export interface ExtractPrayerGuideOptions {
  startPage?: number;
  totalDays?: number;
  startDate?: string;
}
