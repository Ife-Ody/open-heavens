import { notFound } from "next/navigation";
import { constructMetadata } from "@repo/utils";
import { FastingDayContent } from "../components/fasting-day-content";
import { getFastingDayByNumber, getSortedFastingDays } from "../lib";

interface PageProps {
  params: Promise<{ day: string }>;
}

function parseRouteDay(rawDay: string): number | null {
  const day = Number.parseInt(rawDay, 10);
  return Number.isNaN(day) ? null : day;
}

export async function generateStaticParams() {
  return getSortedFastingDays().map((day) => ({
    day: String(day.day),
  }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps) {
  const { day } = await params;
  const dayNumber = parseRouteDay(day);
  if (!dayNumber) {
    return constructMetadata({
      title: "Fasting and Prayer Guide",
    });
  }

  const selectedDay = getFastingDayByNumber(dayNumber);

  if (!selectedDay) {
    return constructMetadata({
      title: "Fasting and Prayer Guide",
    });
  }

  const title = selectedDay.prayerFocus
    ? `Day ${selectedDay.day}: ${selectedDay.prayerFocus}`
    : `Day ${selectedDay.day} Fasting and Prayer`;

  return constructMetadata({
    title: `${title} - 2026 Fasting Guide`,
    description:
      selectedDay.introduction ||
      "Daily fasting and prayer points for the 2026 prayer guide.",
  });
}

export default async function FastingDayPage({ params }: PageProps) {
  const { day } = await params;
  const dayNumber = parseRouteDay(day);

  if (!dayNumber) {
    notFound();
  }

  const days = getSortedFastingDays();
  if (days.length === 0) {
    notFound();
  }

  const selectedDay = days.find((entry) => entry.day === dayNumber);

  if (!selectedDay) {
    notFound();
  }

  return <FastingDayContent days={days} selectedDay={selectedDay} />;
}
