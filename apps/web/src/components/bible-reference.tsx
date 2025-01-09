"use client";

import { useMemo } from "react";
import { toast } from "sonner";
import { useBible } from "src/app/context/bible-context";

interface BibleReferenceProps {
  reference: string;
}

interface ParsedReference {
  book: string;
  chapter: number;
  verses: number[];
}

export function BibleReference({ reference }: BibleReferenceProps) {
  const { openDialog, setBook, setChapter, setSelectedVerses } = useBible();

  const parsedReference = useMemo<ParsedReference | null>(() => {
    try {
      if (!reference) return null;

      const [book, passage] = reference.split(" ");
      if (!book || !passage) return null;

      const [chapter, verseRange] = passage.split(":");
      if (!chapter || !verseRange) return null;

      const verses: number[] = [];
      verseRange.split(/[,]/).forEach((part) => {
        const range = part.split(/[-–—]/).map((v) => parseInt(v.trim()));
        if (range.length === 1) {
          if (!isNaN(range[0])) verses.push(range[0]);
        } else if (range.length === 2) {
          const [start, end] = range;
          if (!isNaN(start) && !isNaN(end)) {
            for (let i = start; i <= end; i++) {
              verses.push(i);
            }
          }
        }
      });

      return {
        book,
        chapter: parseInt(chapter),
        verses,
      };
    } catch (error) {
      console.error("Error parsing reference:", error);
      return null;
    }
  }, [reference]);

  if (!parsedReference) {
    return <span className="text-muted-foreground">{reference}</span>;
  }

  return (
    <button
      className="text-primary"
      onClick={() => {
        setBook(parsedReference.book);
        setChapter(parsedReference.chapter);
        setSelectedVerses(parsedReference.verses);
        openDialog();
      }}
    >
      {reference}
    </button>
  );
}
