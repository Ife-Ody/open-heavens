"use client";

import { Button } from "@repo/ui/components/button";
import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useBibleDialog } from "../context/bible-context";
import { useSettings } from "../context/settings-context";
import { BibleHeader } from "./components/bible-header";

export function BibleReader({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col h-full max-w-3xl gap-6 p-3 mx-auto",
        className,
      )}
    >
      <BibleHeader />
      <BibleReaderBody />
      <BibleReaderFooter />
    </div>
  );
}

export function BibleReaderBody({ className }: { className?: string }) {
  const { book, chapter, loading, verses } = useBibleDialog();
  const { fontSize } = useSettings();
  return (
    <div
      className={cn(
        "flex flex-col flex-1 gap-4 px-6 overflow-y-auto",
        className,
      )}
    >
      <h1 className="text-2xl font-bold">
        {book} {chapter}
      </h1>
      {loading ? (
        <LoadingSkeleton />
      ) : (
        verses.map((verse) => (
          <div
            key={`${verse.book_name}-${verse.chapter}-${verse.verse}`}
            className="flex"
            style={{ fontSize: `${fontSize || 16}px` }}
          >
            <span className="mr-2 text-sm text-muted-foreground">
              {verse.verse}
            </span>
            <p>{verse.text}</p>
          </div>
        ))
      )}
    </div>
  );
}

export function BibleReaderFooter({ className }: { className?: string }) {
  const { bible, book, chapter, setChapter, setSelectedVerses } = useBibleDialog();
  return (
    <div
      className={cn(
        "flex justify-between py-3 mb-3 shrink-0 w-full",
        className,
      )}
    >
      <Button
        onClick={() => {
          setChapter(Math.max(1, chapter - 1));
          setSelectedVerses([]);
        }}
        className="rounded-full"
        variant="outline"
        disabled={chapter <= 1}
        size="sm"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Previous Chapter
      </Button>

      <Button
        onClick={() => {
          setChapter(chapter + 1);
          setSelectedVerses([]);
        }}
        className="rounded-full"
        variant="outline"
        disabled={chapter >= bible.getMaxChapter(book)}
        size="sm"
      >
        Next Chapter <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col flex-1 gap-4 px-6 overflow-y-auto">
      <Skeleton className="w-full h-8" />
      <Skeleton className="w-full h-8" />
      <Skeleton className="w-full h-8" />
      <Skeleton className="w-full h-8" />
      <Skeleton className="w-full h-8" />
      <Skeleton className="w-full h-8" />
      <Skeleton className="w-full h-8" />
      <Skeleton className="w-full h-8" />
      <Skeleton className="w-full h-8" />
    </div>
  );
}
