"use client";

import { useMemo } from "react";
import { useBibleDialog } from "src/app/context/bible-context";
import { normalizeBookName } from "src/lib/bible-utils";

interface BibleReferenceProps {
  reference: string;
}

interface ParsedReference {
  book: string;
  startChapter: number;
  endChapter: number;
  startVerse?: number;
  endVerse?: number;
}

export function BibleReference({ reference }: BibleReferenceProps) {
  const { openDialog, setBook, setChapter, setSelectedVerses } =
    useBibleDialog();

  const parsedReference = useMemo<ParsedReference | null>(() => {
    try {
      if (!reference) return null;

      // Normalize multiple spaces to single spaces before parsing
      const normalizedReference = reference.trim().replace(/\s+/g, " ");

      // Step 1: Split the reference into book and passage
      const bookPattern =
        /^((?:\d+\s+)?[A-Za-z]+(?:(?:\s+(?:of|and|the|[A-Za-z]+))*)?)\s+(.+)$/i;
      const matches = normalizedReference.match(bookPattern);

      if (!matches) {
        console.error("Failed to match book pattern for:", normalizedReference);
        return null;
      }

      const [_, book, passage] = matches;
      if (!book || !passage) return null;

      // Normalize the book name
      const normalizedBook = normalizeBookName(book);

      // Handle different passage formats
      if (
        passage.includes("-") ||
        passage.includes("–") ||
        passage.includes("—")
      ) {
        // Handle chapter range (e.g., "32-35" or "32:1-35:10")
        const [start, end] = passage.split(/[-–—]/);

        // Same chapter verse range (e.g., "20:1-30")
        if (start.includes(":") && !end.includes(":")) {
          const [chapter, startVerse] = start.split(":").map(Number);
          const endVerse = Number(end);

          return {
            book: normalizedBook,
            startChapter: chapter,
            endChapter: chapter,
            startVerse,
            endVerse,
          };
        }
        // Cross-chapter verse references (e.g., "32:1-35:10")
        else if (start.includes(":") || end.includes(":")) {
          const [startChapter, startVerse] = start.split(":").map(Number);
          const [endChapter, endVerse] = end.includes(":")
            ? end.split(":").map(Number)
            : [startChapter, Number(end)];

          return {
            book: normalizedBook,
            startChapter,
            endChapter,
            startVerse,
            endVerse,
          };
        } else {
          // Chapter range only (e.g., "32-35")
          return {
            book: normalizedBook,
            startChapter: parseInt(start),
            endChapter: parseInt(end),
          };
        }
      } else if (passage.includes(":")) {
        // Single chapter with verses (e.g., "32:1,3,5-7")
        const [chapter, verseRange] = passage.split(":");
        const chapterNum = parseInt(chapter);

        // Verse range within chapter (e.g., "32:1-7")
        if (
          verseRange.includes("-") ||
          verseRange.includes("–") ||
          verseRange.includes("—")
        ) {
          const [startVerse, endVerse] = verseRange.split(/[-–—]/);
          const startVerseNum = parseInt(startVerse.trim());
          const endVerseNum = parseInt(endVerse.trim());

          return {
            book: normalizedBook,
            startChapter: chapterNum,
            endChapter: chapterNum,
            startVerse: startVerseNum,
            endVerse: endVerseNum,
          };
        }
        // Comma-separated verses (e.g., "32:1,3,5")
        else if (verseRange.includes(",")) {
          const verses = verseRange.split(",").map((v) => parseInt(v.trim()));
          const firstVerse = Math.min(...verses);
          const lastVerse = Math.max(...verses);

          return {
            book: normalizedBook,
            startChapter: chapterNum,
            endChapter: chapterNum,
            startVerse: firstVerse,
            endVerse: lastVerse,
          };
        }
        // Single verse (e.g., "32:1")
        else {
          const verseNum = parseInt(verseRange.trim());
          return {
            book: normalizedBook,
            startChapter: chapterNum,
            endChapter: chapterNum,
            startVerse: verseNum,
            endVerse: verseNum,
          };
        }
      } else {
        // Single chapter only (e.g., "32")
        const chapter = parseInt(passage);
        return {
          book: normalizedBook,
          startChapter: chapter,
          endChapter: chapter,
        };
      }
    } catch (error) {
      console.error("Error parsing reference:", error, "Reference:", reference);
      return null;
    }
  }, [reference]);

  if (!parsedReference) {
    return <span className="text-muted-foreground">{reference}</span>;
  }

  const handleClick = () => {
    setBook(parsedReference.book);
    setChapter(parsedReference.startChapter);

    // Generate array of verses if verse range is specified
    if (
      parsedReference.startVerse !== undefined &&
      parsedReference.endVerse !== undefined
    ) {
      const startVerse = parsedReference.startVerse;
      const endVerse = parsedReference.endVerse;

      // Create an array with all verses in the range
      const verses = [];
      for (let v = startVerse; v <= endVerse; v++) {
        verses.push(v);
      }

      setSelectedVerses(verses);
    } else {
      setSelectedVerses([]);
    }

    openDialog();
  };

  return (
    <button className="text-primary" onClick={handleClick}>
      {reference}
    </button>
  );
}
