"use client";

import { useMemo } from "react";
import { useBible } from "src/app/context/bible-context";

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
  const { openDialog, setBook, setChapter, setSelectedVerses } = useBible();

  const parsedReference = useMemo<ParsedReference | null>(() => {
    try {
      if (!reference) return null;

      // Improved splitting to handle numbered books (e.g. "1 Thessalonians")
      const matches = reference.match(/^((?:\d\s+)?[A-Za-z]+)\s+(.+)$/);
      if (!matches) return null;

      const [_, book, passage] = matches;
      if (!book || !passage) return null;

      // Handle different passage formats
      if (passage.includes("-") || passage.includes("–") || passage.includes("—")) {
        // Handle chapter range (e.g., "32-35" or "32:1-35:10")
        const [start, end] = passage.split(/[-–—]/);
        
        if (start.includes(":") || end.includes(":")) {
          // Format: "32:1-35:10"
          const [startChapter, startVerse] = start.split(":").map(Number);
          const [endChapter, endVerse] = end.split(":").map(Number);
          
          return {
            book,
            startChapter,
            endChapter,
            startVerse,
            endVerse
          };
        } else {
          // Format: "32-35"
          return {
            book,
            startChapter: parseInt(start),
            endChapter: parseInt(end)
          };
        }
      } else if (passage.includes(":")) {
        // Single chapter with verses (e.g., "32:1,3,5-7")
        const [chapter, verseRange] = passage.split(":");
        return {
          book,
          startChapter: parseInt(chapter),
          endChapter: parseInt(chapter),
          startVerse: parseInt(verseRange.split(/[-–—,]/)[0]),
          endVerse: parseInt(verseRange.split(/[-–—,]/).pop() || verseRange)
        };
      } else {
        // Single chapter only (e.g., "32")
        const chapter = parseInt(passage);
        return {
          book,
          startChapter: chapter,
          endChapter: chapter
        };
      }
    } catch (error) {
      console.error("Error parsing reference:", error);
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
    if (parsedReference.startVerse && parsedReference.endVerse) {
      const verses = Array.from(
        { length: parsedReference.endVerse - parsedReference.startVerse + 1 },
        (_, i) => parsedReference.startVerse! + i
      );
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
