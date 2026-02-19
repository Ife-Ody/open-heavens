import { SelectedPost } from "@/components/post-template";
import { Header } from "./Header";
import {
  getDevotionalPostByDate,
  getLatestDevotionalPost,
} from "@/lib/devotionals";

import { constructMetadata, truncate } from "@repo/utils";

const getHomepagePost = async () => {
  const todayPost = await getDevotionalPostByDate(new Date());
  if (todayPost) {
    return todayPost;
  }

  return getLatestDevotionalPost();
};

export const generateMetadata = async () => {
  const post = await getHomepagePost();
  if (!post) {
    return constructMetadata({
      title: "Open Heavens Daily Devotional",
    });
  }
  return constructMetadata({
    title: `${truncate(
      `Open Heavens for ${post.date}: ${post.title}...`,
      60,
    )}`,
    description: post.bodyText ? `${truncate(post.bodyText, 160)}` : undefined,
  });
};

export default async function Page() {
  const post = await getHomepagePost();

  return (
    <main className="mx-auto container relative flex flex-col items-center justify-center min-h-screen gap-6 p-8 pb-16 md:px-24">
      <Header />
      <div className="flex-1">
        <SelectedPost initialPost={post} />
      </div>
    </main>
  );
}

export const dynamic = "force-dynamic";
