"use client";
import { Post, allPosts } from "contentlayer/generated";
import { isSameDay } from "date-fns";
import { Mdx } from "src/components/mdx-components";
import { useSettings } from "./context/settings-context";

export function PostCard() {
  const settings = useSettings();
  const { date } = settings;
  const post = allPosts.find((post) => isSameDay(post.date, date)) as Post;

  if (!post) return <h1>Could not find the post for the selected day</h1>;

  return (
    <div className="flex flex-col gap-3">
      <h1 className="mb-1 text-4xl font-semibold">{post.title}</h1>
      <div className="">
        <p className="p-3 border-l-2 text-primary">{post.verse}</p>
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold uppercase">Read:</h2>
        <p className="text-primary">{post.reading}</p>
      </div>
      <Mdx post={post.body.code} />
    </div>
  );
}
