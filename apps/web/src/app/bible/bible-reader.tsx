"use client";

import { Button } from "@repo/ui/components/button";
import { useBible } from "../context/bible-context";
import { useSettings } from "../context/settings-context";
import { BibleHeader } from "./components/bible-header";
import { Skeleton } from "@repo/ui/components/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
export function BibleReader() {
  const {
    bible,
    currentVerses,
    currentBook,
    currentChapter,
    setChapter,
    loading,
  } = useBible();
  const { fontSize } = useSettings();

  return (
    <div className="flex flex-col h-full max-w-2xl gap-6 p-4 mx-auto">
      <BibleHeader />
      <div className="flex flex-col flex-1 gap-4 px-6 overflow-y-auto">
        <h1 className="text-2xl font-bold">
          {currentBook} {currentChapter}
        </h1>
        {loading ? (
          <LoadingSkeleton />
        ) : (
          currentVerses.map((verse) => (
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
      <div className="flex justify-between shrink-0">
        <Button
          onClick={() => setChapter(Math.max(1, currentChapter - 1))}
          className="rounded-full"
          variant="outline"
          disabled={currentChapter <= 1}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous Chapter
        </Button>

        <Button
          onClick={() => setChapter(currentChapter + 1)}
          className="rounded-full"
          variant="outline"
          disabled={currentChapter >= bible.getMaxChapter(currentBook)}
        >
          Next Chapter <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
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
