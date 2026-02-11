import { notFound, redirect } from "next/navigation";
import { getTodayFastingDayOrFirst } from "./lib";

export default function FastingRootPage() {
  const targetDay = getTodayFastingDayOrFirst();
  if (!targetDay) {
    notFound();
  }

  redirect(`/fasting/${targetDay.day}`);
}
