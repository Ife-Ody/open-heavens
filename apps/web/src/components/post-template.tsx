"use client";
import { cn } from "@/lib/utils";
import { addDays, isSameDay } from "date-fns";
import parse from "html-react-parser";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Post, posts } from "src/app/content/posts";
import { useSettings } from "src/app/context/settings-context";

import { UserDisplay } from "@repo/ui/components/user-display";
import Link from "next/link";
import type { JSX } from "react";
import { hymns } from "src/app/content/hymns";
import { BibleTagger } from "../lib/bible-tagger";
import { BibleReference } from "./bible-reference";

export function PostTemplate({ post }: { post: Post }) {
  const bibleTagger = new BibleTagger();
  const settings = useSettings();
  const { fontSize, date } = settings;

  return (
    <article className="flex flex-col gap-8 whitespace-wrap">
      <header className="flex flex-col gap-3">
        <h1
          className={cn(`text-[${fontSize * 1.5}px] font-semibold`)}
          itemProp="headline"
        >
          {post.title}
        </h1>
        <meta
          itemProp="datePublished"
          content={new Date(post.date).toISOString()}
        />
        <div
          className={cn(`text-[${fontSize}px] font-medium flex flex-col gap-2`)}
          itemProp="author"
          itemScope
          itemType="https://schema.org/Person"
        >
          <UserDisplay
            user={{
              username: "eaadeboye.com",
              profile: {
                firstname: "Pastor",
                lastname: "E.A. Adeboye",
                avatar: "/adeboye.webp",
              },
            }}
          />
        </div>
      </header>

      <section aria-label="Memory Verse">
        <h2 className={cn(`text-[${fontSize + 2}px] font-bold uppercase`)}>
          Memory Verse
        </h2>
        <blockquote className="p-3 pl-6 italic border-l-2 text-muted-foreground">
          {post.memorizeText}
        </blockquote>
        <p className={cn("font-semibold text-primary", `text-[${fontSize}px]`)}>
          <cite>
            {bibleTagger.parseHTML(post.memorizeVerse, BibleReference)}
          </cite>{" "}
          (KJV)
        </p>
      </section>

      <section aria-label="Bible Reading">
        <h2 className={cn(`text-[${fontSize + 2}px] font-bold uppercase`)}>
          Read
        </h2>
        <div
          className={cn("font-semibold text-primary", `text-[${fontSize}px]`)}
        >
          {bibleTagger.parseHTML(post.read, BibleReference)}
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
          {bibleTagger.parseHTML(post.bodyText, BibleReference)}
        </div>
      </section>

      {post.pointHeader && (
        <section aria-label="Key Points">
          <h2
            className={cn(
              `text-[${fontSize + 2}px] font-bold uppercase`,
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
            {bibleTagger.parseHTML(post.bibleInOneYear, BibleReference)}
          </div>
        </section>
      )}

      {post.hymn_id && (
        <section aria-label="Hymn" className="flex flex-col gap-3">
          <h2 className={cn(`text-[${fontSize + 2}px] font-bold uppercase`)}>
            Hymn
          </h2>
          <div
            className={cn(
              "leading-7 text-justify whitespace-normal break-words",
              `text-[${fontSize}px]`,
            )}
          >
            <Hymn hymn_id={post.hymn_id} />
          </div>
        </section>
      )}

      <section aria-label="Navigation" className="flex justify-between mt-6">
        <Link
          prefetch={true}
          href={`/${addDays(post.date, -1).toISOString().split("T")[0]}`}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-md bg-secondary hover:bg-secondary/80"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous Day</span>
        </Link>
        <Link
          prefetch={true}
          href={`/${addDays(post.date, 1).toISOString().split("T")[0]}`}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-md bg-secondary hover:bg-secondary/80"
        >
          <span>Next Day</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </section>
    </article>
  );
}

interface Hymn {
  id: number;
  hymn_number: number;
  title: string;
  hymn_image: string;
  hymn_url: string;
  lyrics: string;
}

function Hymn({ hymn_id }: { hymn_id: number }): JSX.Element {
  const hymn = hymns.find((hymn) => hymn.id === hymn_id);
  const settings = useSettings();
  const { fontSize } = settings;

  if (!hymn) return <div>Hymn not found</div>;
  return (
    <div className="flex flex-col gap-6">
      <h3 className={cn(`text-[${fontSize}px] font-bold uppercase`)}>
        Title: {hymn?.title}
      </h3>
      <iframe
        src={`https://www.youtube.com/embed/${new URL(hymn?.hymn_url!).searchParams.get("v")}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full max-w-3xl rounded-lg aspect-video"
      />
      <div className={cn(`text-[${fontSize}px]`)}>{parse(hymn?.lyrics!)}</div>
      <Link href={`/hymns/${hymn_id}`} className="hover:underline text-primary">
        Go to Hymn {hymn?.hymn_number}: {hymn?.title}
      </Link>
      <Link href={`/hymns`} className="hover:underline text-primary">
        Browse all hymns
      </Link>
    </div>
  );
}

export const SelectedPost = (): JSX.Element => {
  const settings = useSettings();
  const { date } = settings;
  const post = posts.find((post) => isSameDay(post.date, date)) as Post;
  if (!post) return <EmptyPost />;
  return <PostTemplate post={post}></PostTemplate>;
};

const EmptyPost = () => (
  <div className="flex flex-col items-center justify-center gap-2 text-center min-h-96">
    <h1 className="text-2xl font-bold">Could not find the requested post</h1>
    <Link href="/" className="underline text-primary">
      Go to today's post
    </Link>
  </div>
);
