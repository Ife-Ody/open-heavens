import { getPrayerGuideDays, type PrayerGuideDay } from "@repo/fasting";
import { getTodayDateKeyInAppTimeZone } from "@/lib/date";

const fastingDays = getPrayerGuideDays().slice().sort((a, b) => a.day - b.day);
const fastingDayByNumber = new Map(fastingDays.map((day) => [day.day, day]));

export function getSortedFastingDays(): PrayerGuideDay[] {
  return fastingDays.slice();
}

export function getFastingDayByNumber(day: number): PrayerGuideDay | undefined {
  return fastingDayByNumber.get(day);
}

export function getTodayFastingDayOrFirst(): PrayerGuideDay | null {
  const firstDay = fastingDays[0];
  if (!firstDay) return null;

  const todayDateKey = getTodayDateKeyInAppTimeZone();
  const todayMatch = fastingDays.find((entry) => entry.date === todayDateKey);

  return todayMatch ?? firstDay;
}

function formatDate(value: string, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("en-US", {
    ...options,
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

export function formatFastingDateLong(value: string): string {
  return formatDate(value, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatFastingDateShort(value: string): string {
  return formatDate(value, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
