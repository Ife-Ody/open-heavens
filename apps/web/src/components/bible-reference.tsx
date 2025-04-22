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

      // Handle comma-separated verse references (e.g. "3:16, 18, 20")
      if (passage.includes(",")) {
        const parts = passage.split(",").map(p => p.trim());
        const allVerses: number[] = [];
        let mainChapter: number | null = null;
        
        // Process each comma-separated part
        for (const part of parts) {
          if (part.includes(":")) {
            // This part has a chapter:verse format
            const [chapterStr, verseStr] = part.split(":");
            const chapter = Number(chapterStr);
            
            // Store the chapter from the first part for parts that only have verse numbers
            if (mainChapter === null) {
              mainChapter = chapter;
            }
            
            if (verseStr.includes("-") || verseStr.includes("–") || verseStr.includes("—")) {
              // Handle verse ranges (e.g., "5-7")
              const [startVerseStr, endVerseStr] = verseStr.split(/[-–—]/);
              const startVerse = Number(startVerseStr.trim());
              const endVerse = Number(endVerseStr.trim());
              
              if (!isNaN(startVerse) && !isNaN(endVerse)) {
                for (let v = startVerse; v <= endVerse; v++) {
                  allVerses.push(v);
                }
              }
            } else {
              // Single verse
              const verse = Number(verseStr);
              if (!isNaN(verse)) {
                allVerses.push(verse);
              }
            }
          } else if (part.includes("-") || part.includes("–") || part.includes("—")) {
            // Just a verse range without chapter (e.g., "5-7")
            const [startVerseStr, endVerseStr] = part.split(/[-–—]/);
            const startVerse = Number(startVerseStr.trim());
            const endVerse = Number(endVerseStr.trim());
            
            if (!isNaN(startVerse) && !isNaN(endVerse) && mainChapter !== null) {
              for (let v = startVerse; v <= endVerse; v++) {
                allVerses.push(v);
              }
            }
          } else {
            // Just a verse number
            const verse = Number(part);
            if (!isNaN(verse) && mainChapter !== null) {
              allVerses.push(verse);
            }
          }
        }
        
        if (allVerses.length > 0 && mainChapter !== null) {
          return {
            book: normalizedBook,
            startChapter: mainChapter,
            endChapter: mainChapter,
            startVerse: Math.min(...allVerses),
            endVerse: Math.max(...allVerses),
          };
        }
      }
      
      // Handle different passage formats (the original logic for non-comma cases)
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
      // Check if the original reference contains commas, which indicates specific verses
      if (reference.includes(",")) {
        const verses: number[] = [];
        
        // Extract the verse part from the reference (everything after the book and chapter)
        const bookAndChapterMatch = reference.match(/^(.*?\d+):/);
        if (bookAndChapterMatch) {
          const versePart = reference.substring(bookAndChapterMatch[0].length);
          
          // Split by commas and process each part
          const parts = versePart.split(",").map(p => p.trim());
          
          for (const part of parts) {
            if (part.match(/[-–—]/)) {
              // Handle ranges like "5-7"
              const [start, end] = part.split(/[-–—]/).map(v => parseInt(v.trim(), 10));
              if (!isNaN(start) && !isNaN(end)) {
                for (let v = start; v <= end; v++) {
                  verses.push(v);
                }
              }
            } else {
              // Handle single verses
              const verse = parseInt(part, 10);
              if (!isNaN(verse)) {
                verses.push(verse);
              }
            }
          }
        }
        
        if (verses.length > 0) {
          setSelectedVerses(verses);
        } else {
          // Fallback to the original calculation if parsing fails
          const startVerse = parsedReference.startVerse;
          const endVerse = parsedReference.endVerse;
          const verses = [];
          for (let v = startVerse; v <= endVerse; v++) {
            verses.push(v);
          }
          setSelectedVerses(verses);
        }
      } else {
        // Handle non-comma references (ranges like "5-7")
        const startVerse = parsedReference.startVerse;
        const endVerse = parsedReference.endVerse;

        // Create an array with all verses in the range
        const verses = [];
        for (let v = startVerse; v <= endVerse; v++) {
          verses.push(v);
        }

        setSelectedVerses(verses);
      }
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
