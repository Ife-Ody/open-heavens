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
        if (!start || !end) return null;

        // Same chapter verse range (e.g., "20:1-30")
        if (start.includes(":") && !end.includes(":")) {
          const [chapter, startVerseStr] = start.split(":");
          if (!chapter || !startVerseStr) return null;

          const chapterNum = Number(chapter);
          const startVerse = Number(startVerseStr);
          const endVerse = Number(end);

          if (isNaN(chapterNum) || isNaN(startVerse) || isNaN(endVerse))
            return null;

          return {
            book: normalizedBook,
            startChapter: chapterNum,
            endChapter: chapterNum,
            startVerse,
            endVerse,
          };
        }
        // Cross-chapter verse references (e.g., "32:1-35:10")
        else if (start.includes(":") || end.includes(":")) {
          const [startChapterStr, startVerseStr] = start.split(":");
          if (!startChapterStr || !startVerseStr) return null;

          const startChapter = Number(startChapterStr);
          const startVerse = Number(startVerseStr);

          let endChapter: number, endVerse: number;

          if (end.includes(":")) {
            const [endChapterStr, endVerseStr] = end.split(":");
            if (!endChapterStr || !endVerseStr) return null;
            endChapter = Number(endChapterStr);
            endVerse = Number(endVerseStr);
          } else {
            endChapter = startChapter;
            endVerse = Number(end);
          }

          if (
            isNaN(startChapter) ||
            isNaN(startVerse) ||
            isNaN(endChapter) ||
            isNaN(endVerse)
          )
            return null;

          return {
            book: normalizedBook,
            startChapter,
            endChapter,
            startVerse,
            endVerse,
          };
        } else {
          // Chapter range only (e.g., "32-35")
          const startChapter = Number(start);
          const endChapter = Number(end);

          if (isNaN(startChapter) || isNaN(endChapter)) return null;

          return {
            book: normalizedBook,
            startChapter,
            endChapter,
          };
        }
      } else if (passage.includes(":")) {
        const [chapterStr, verseRange] = passage.split(":");
        if (!chapterStr || !verseRange) return null;

        const chapter = Number(chapterStr);
        if (isNaN(chapter)) return null;

        if (verseRange.match(/[-–—]/)) {
          const [startVerseStr, endVerseStr] = verseRange.split(/[-–—]/);
          if (!startVerseStr || !endVerseStr) return null;

          const startVerse = Number(startVerseStr.trim());
          const endVerse = Number(endVerseStr.trim());

          if (isNaN(startVerse) || isNaN(endVerse)) return null;

          return {
            book: normalizedBook,
            startChapter: chapter,
            endChapter: chapter,
            startVerse,
            endVerse,
          };
        } else if (verseRange.includes(",")) {
          const verses = verseRange
            .split(",")
            .map((v) => Number(v.trim()))
            ?.filter((v) => !isNaN(v));

          if (verses.length === 0) return null;

          return {
            book: normalizedBook,
            startChapter: chapter,
            endChapter: chapter,
            startVerse: Math.min(...verses),
            endVerse: Math.max(...verses),
          };
        } else {
          const verse = Number(verseRange.trim());
          if (isNaN(verse)) return null;

          return {
            book: normalizedBook,
            startChapter: chapter,
            endChapter: chapter,
            startVerse: verse,
            endVerse: verse,
          };
        }
      } else {
        const chapter = Number(passage);
        if (isNaN(chapter)) return null;

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
