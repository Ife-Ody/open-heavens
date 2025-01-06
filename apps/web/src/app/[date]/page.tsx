import { SelectedPost } from "@/components/post-template";
import { isSameDay } from "date-fns";
import { posts } from "src/app/content/posts";

import { Header } from "../Header";
import { constructMetadata, truncate } from "@repo/utils";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ date: string }>;
}) => {
  const { date: dateParam } = await params;
  const date = new Date(dateParam);

  const post = posts.find((post) => isSameDay(new Date(post.date), date));
  return constructMetadata({
    title: `${truncate(`${date.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long", 
      year: "numeric",
    })} - ${post?.title} - Open Heavens today`, 60)}`,
    description: `${truncate(post?.bodyText, 160)}...`,
  });
};

export default async function Page() {
  return (
    <main className="container relative flex flex-col items-center justify-center min-h-screen gap-6 p-8 pb-16 md:px-24">
      <Header />
      <div className="flex-1">{<SelectedPost />}</div>
    </main>
  );
}

export async function generateStaticParams() {
  return posts.map((post) => ({ date: post.date }));
}
