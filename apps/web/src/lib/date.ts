const APP_TIME_ZONE = process.env.APP_TIME_ZONE ?? "Africa/Lagos";

export function getTodayDateKeyInAppTimeZone(now = new Date()): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(now);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Failed to resolve app time zone date.");
  }

  return `${year}-${month}-${day}`;
}
