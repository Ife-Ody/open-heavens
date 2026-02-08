import { SelectedPost } from "@/components/post-template";
import { Header } from "./Header";
import { getDevotionalPostByDate } from "@/lib/devotionals";

import { constructMetadata, truncate } from "@repo/utils";

export const generateMetadata = async () => {
  const post = await getDevotionalPostByDate(new Date());
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

export default async function Page() {
  const todayPost = await getDevotionalPostByDate(new Date());

  return (
    <main className="mx-auto container relative flex flex-col items-center justify-center min-h-screen gap-6 p-8 pb-16 md:px-24">
      <Header />
      <div className="flex-1">
        <SelectedPost initialPost={todayPost} />
      </div>
    </main>
  );
}

export const revalidate = 21600; // Revalidate every 6 hours
