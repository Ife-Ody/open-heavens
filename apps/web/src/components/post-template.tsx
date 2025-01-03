"use client";
import { cn, titleCase } from "@/lib/utils";
import { isSameDay } from "date-fns";
import parse from "html-react-parser";
import { Post, posts } from "src/app/content/posts";
import { useSettings } from "src/app/context/settings-context";

import type { JSX } from "react";
import BibleReference from "./bible-reference";

export function PostTemplate({ post }: { post: Post }): JSX.Element {
  const settings = useSettings();
  const { fontSize } = settings;

  if (!post) return <EmptyPost />;

  return (
    <div className="flex flex-col gap-3 whitespace-wrap">
      <h1 className={cn(`text-[${fontSize * 1.5}px] font-semibold`)}>
        {titleCase(post.title)}
      </h1>
      <h2 className={cn(`text-[${fontSize + 2}px] font-bold uppercase`)}>
        Memory Verse
      </h2>
      <blockquote className="p-3 pl-6 italic border-l-2 text-muted-foreground">
        {post.memorizeText}
      </blockquote>
      <p className={cn("font-semibold text-primary", `text-[${fontSize}px]`)}>
        {post.memorizeVerse} (KJV)
      </p>
      <h2 className={cn(`text-[${fontSize + 2}px] font-bold uppercase`)}>
        Read
      </h2>
      <div className={cn("font-semibold text-primary", `text-[${fontSize}px]`)}>
        <BibleReference content={post.read} />
      </div>
      <h2 className={cn(`text-[${fontSize + 2}px] font-bold uppercase`)}>
        Message
      </h2>
      <div
        className={cn(
          "leading-7 text-justify whitespace-normal break-words",
          `text-[${fontSize}px]`,
        )}
      >
        {/* <BibleReference content={post.bodyText} /> */}
        {parse(post.bodyText)}
      </div>
      <div>
        {post.pointHeader && (
          <h2
            className={cn(
              `text-[${fontSize + 2}px] font-bold uppercase leading-0`,
            )}
          >
            {post.pointHeader}
          </h2>
        )}
        {post.pointText && (
          <p className={cn("leading-7 text-justify", `text-[${fontSize}px]`)}>
            {post.pointText}
          </p>
        )}
      </div>
      <div>
        {post.bibleInOneYear && (
          <>
            <h2 className={cn(`text-[${fontSize + 2}px] font-bold uppercase`)}>
              Bible in one Year
            </h2>
            <div
              className={cn(
                "font-semibold text-primary",
                `text-[${fontSize}px]`,
              )}
            >
              <BibleReference content={post.bibleInOneYear} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export const SelectedPost = (): JSX.Element => {
  const settings = useSettings();
  const { date } = settings;
  const post = posts.find((post) => isSameDay(post.date, date)) as Post;
  return <PostTemplate post={post}></PostTemplate>;
};

const EmptyPost = () => <h1>Could not find the requested post</h1>;
