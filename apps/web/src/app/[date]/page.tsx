import { SelectedPost } from "@/components/post-template";
import { isValid, parseISO } from "date-fns";
import { notFound } from "next/navigation";
import { getDevotionalDates, getDevotionalPostByDate } from "@/lib/devotionals";

import { constructMetadata, truncate } from "@repo/utils";
import { Header } from "../Header";

const DATE_PARAM_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ date: string }>;
}) => {
  const { date: dateParam } = await params;
  if (!DATE_PARAM_PATTERN.test(dateParam)) {
    return constructMetadata({
      title: "Page Not Found - Open Heavens",
      description: "The requested devotional could not be found.",
    });
  }

  const date = parseISO(dateParam);

  if (!isValid(date)) {
    return constructMetadata({
      title: "Page Not Found - Open Heavens",
      description: "The requested devotional could not be found.",
    });
  }

  const post = await getDevotionalPostByDate(dateParam);
  return constructMetadata({
    title: `${truncate(
      `Open Heavens for today - ${date.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })} - ${post?.title}`,
      60,
    )}`,
    description: post?.bodyText
      ? `${truncate(post?.bodyText, 160)}`
      : undefined,
  });
};

export default async function Page({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date: dateParam } = await params;
  if (!DATE_PARAM_PATTERN.test(dateParam)) {
    notFound();
  }

  const date = parseISO(dateParam);

  if (!isValid(date)) {
    notFound();
  }

  const post = await getDevotionalPostByDate(dateParam);
  if (!post) {
    notFound();
  }

  return (
    <main className="mx-auto container relative flex flex-col items-center justify-center min-h-screen gap-6 p-8 pb-16 md:px-24">
      <Header />
      <div className="flex-1">{<SelectedPost initialPost={post} />}</div>
    </main>
  );
}

export async function generateStaticParams() {
  const dates = await getDevotionalDates();
  return dates.map((date) => ({ date }));
}
