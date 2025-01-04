"use client";
import { cn, titleCase } from "@/lib/utils";
import { isSameDay } from "date-fns";
import parse from "html-react-parser";
import { Post, posts } from "src/app/content/posts";
import { useSettings } from "src/app/context/settings-context";

import type { JSX } from "react";
import { useBible } from "src/app/context/bible-context";
import BibleReference from "./bible-reference";

export function PostTemplate({ post }: { post: Post }): JSX.Element {
  const settings = useSettings();
  const { fontSize } = settings;
  const { openDialog, setBook, setChapter } = useBible();
  if (!post) return <EmptyPost />;

  return (
    <article className="flex flex-col gap-3 whitespace-wrap">
      <header>
        <h1
          className={cn(`text-[${fontSize * 1.5}px] font-semibold`)}
          itemProp="headline"
        >
          {titleCase(post.title)}
        </h1>
        <meta
          itemProp="datePublished"
          content={new Date(post.date).toISOString()}
        />
      </header>

      <section aria-label="Memory Verse">
        <h2 className={cn(`text-[${fontSize + 2}px] font-bold uppercase`)}>
          Memory Verse
        </h2>
        <blockquote className="p-3 pl-6 italic border-l-2 text-muted-foreground">
          {post.memorizeText}
        </blockquote>
        <p className={cn("font-semibold text-primary", `text-[${fontSize}px]`)}>
          <cite>{post.memorizeVerse}</cite> (KJV)
        </p>
      </section>

      <section aria-label="Bible Reading">
        <h2 className={cn(`text-[${fontSize + 2}px] font-bold uppercase`)}>
          Read
        </h2>
        <div
          className={cn("font-semibold text-primary", `text-[${fontSize}px]`)}
        >
          <BibleReference content={post.read} />
        </div>
      </section>

      <section aria-label="Main Message" itemProp="articleBody">
        <h2 className={cn(`text-[${fontSize + 2}px] font-bold uppercase`)}>
          Message
        </h2>
        <div
          className={cn(
            "leading-7 text-justify whitespace-normal break-words",
            `text-[${fontSize}px]`,
          )}
        >
          {parse(post.bodyText)}
        </div>
      </section>

      {post.pointHeader && (
        <section aria-label="Key Points">
          <h2
            className={cn(
              `text-[${fontSize + 2}px] font-bold uppercase leading-0`,
            )}
          >
            {post.pointHeader}
          </h2>
          {post.pointText && (
            <p className={cn("leading-7 text-justify", `text-[${fontSize}px]`)}>
              {post.pointText}
            </p>
          )}
        </section>
      )}

      {post.bibleInOneYear && (
        <section aria-label="Bible in One Year">
          <h2 className={cn(`text-[${fontSize + 2}px] font-bold uppercase`)}>
            Bible in one Year
          </h2>
          <div
            className={cn("font-semibold text-primary", `text-[${fontSize}px]`)}
          >
            <BibleReference content={post.bibleInOneYear} />
          </div>
        </section>
      )}
    </article>
  );
}

export const SelectedPost = (): JSX.Element => {
  const settings = useSettings();
  const { date } = settings;
  const post = posts.find((post) => isSameDay(post.date, date)) as Post;
  return <PostTemplate post={post}></PostTemplate>;
};

const EmptyPost = () => <h1>Could not find the requested post</h1>;
