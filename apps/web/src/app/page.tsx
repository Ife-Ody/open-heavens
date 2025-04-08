import { SelectedPost } from "@/components/post-template";
import { isToday } from "date-fns";
import { posts } from "src/app/content/posts";
import { Header } from "./Header";

import { constructMetadata, truncate } from "@repo/utils";
import type { JSX } from "react";

export const generateMetadata = () => {
  const post = posts.find((post) => isToday(new Date(post.date)));
  if (!post) {
    return constructMetadata({
      title: "Open Heavens Daily Devotional",
    });
  }
  return constructMetadata({
    title: `${truncate(
      `Open Heavens for today - ${new Date().toLocaleDateString("en-GB", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      })}: ${post?.title}...`,
      60,
    )}`,
    description: post?.bodyText
      ? `${truncate(post?.bodyText, 160)}`
      : undefined,
  });
};

export default function Page(): JSX.Element {
  return (
    <main className="container relative flex flex-col items-center justify-center min-h-screen gap-6 p-8 pb-16 md:px-24">
      <Header />
      <div className="flex-1">
        <SelectedPost />
      </div>
    </main>
  );
}

export const revalidate = 21600; // Revalidate every 6 hours
