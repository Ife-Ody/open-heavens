"use client";

import { cn, titleCase } from "@/lib/utils";
import { isSameDay } from "date-fns";
import parse from "html-react-parser";
import { Post, posts } from "src/app/content/posts";
import { useSettings } from "src/app/context/settings-context";

export function PostTemplate({ post }: { post: Post }): JSX.Element {
  const settings = useSettings();
  const { fontSize } = settings;

  if (!post) return <EmptyPost />;

  return (
    <div className="flex flex-col gap-3 whitespace-wrap">
      <h1 className="mb-1 text-4xl font-semibold">{titleCase(post.title)}</h1>
      <h2 className="mt-3 text-xl font-bold uppercase">Memory Verse</h2>
      <blockquote className="p-3 pl-6 italic border-l-2 text-muted-foreground">
        {post.memorizeText}
      </blockquote>
      <p className="font-semibold text-primary">{post.memorizeVerse} (KJV)</p>
      <h2 className="mt-3 text-xl font-bold uppercase">Read</h2>
      <p className="font-semibold text-primary">{post.read}</p>
      <h2 className="mt-3 text-xl font-bold uppercase">Message</h2>
      <div
        className={cn(
          "leading-7 text-justify whitespace-normal break-words",
          `text-${fontSize}`,
        )}
      >
        {parse(post.bodyText, {
          transform(reactNode, domNode, index) {
            // this will wrap every element in a paragraph tag
            return <p>{reactNode}</p>;
          },
        })}
      </div>
      <br />
      <div>
        {post.pointHeader && (
          <h2 className="text-xl font-bold uppercase leading-0">
            {post.pointHeader}
          </h2>
        )}
        {post.pointText && (
          <p className={cn("leading-7 text-justify", `text-${fontSize}`)}>
            {post.pointText}
          </p>
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
