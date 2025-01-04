import { SelectedPost } from "@/components/post-template";
import { isToday } from "date-fns";
import { posts } from "src/app/content/posts";
import { Header } from "./Header";

import { constructMetadata } from "@repo/utils";
import type { JSX } from "react";

export const generateMetadata = () => {
  const post = posts.find((post) => isToday(new Date(post.date)));
  return constructMetadata({
    title: `Open Heavens for today - ${new Date().toLocaleDateString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })}: ${post?.title}`,
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
