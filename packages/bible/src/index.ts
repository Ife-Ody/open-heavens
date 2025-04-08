import { versions } from "./en";
import type { BibleVerse, VerseSelector } from "./types";

export type {
  BibleVerse,
  BibleVersion,
  VerseRange,
  VerseSelector,
} from "./types";

export class Bible {
  version: string = "kjv";

  constructor(version: string = "kjv") {
    this.setVersion(version);
  }

  setVersion(version: string): Bible {
    if (!versions[version as keyof typeof versions]) {
      throw new Error(`Version ${version} not found`);
    }
    this.version = version;
    return this;
  }

  getVerses(
    book: string,
    chapter: number,
    verseSelector?: VerseSelector,
  ): BibleVerse[] {
    const versionBible = versions[this.version as keyof typeof versions];

    if (!book || !chapter) {
      throw new Error("Book and chapter are required");
    }

    // Normalize the book name before searching
    const normalizedBook = normalizeBookName(book);

    const verses = versionBible.verses.filter(
      (verse: BibleVerse) =>
        verse.book_name === normalizedBook && verse.chapter === chapter,
    );

    if (verses.length === 0) {
      throw new Error(`No verses found for ${book} ${chapter}`);
    }

    if (!verseSelector) {
      return verses;
    }

    // Handle different verse selection formats
    if (typeof verseSelector === "number") {
      return verses.filter((v: BibleVerse) => v.verse === verseSelector);
    }

    if (Array.isArray(verseSelector)) {
      if (verseSelector.length === 0) {
        return verses;
      }
      return verses.filter((v: BibleVerse) => verseSelector.includes(v.verse));
    }

    // Handle verse range
    const {
      start = 1,
      end = Math.max(...verses.map((v: BibleVerse) => v.verse)),
    } = verseSelector;
    return verses.filter((v: BibleVerse) => v.verse >= start && v.verse <= end);
  }

  getMaxChapter(book: string): number {
    const versionBible = versions[this.version as keyof typeof versions];
    // Also normalize book name here
    const normalizedBook = normalizeBookName(book);
    return Math.max(
      ...versionBible.verses
        .filter((v: BibleVerse) => v.book_name === normalizedBook)
        .map((v: BibleVerse) => v.chapter),
    );
  }

  getMaxVerse(book: string, chapter: number): number {
    const versionBible = versions[this.version as keyof typeof versions];
    // And here
    const normalizedBook = normalizeBookName(book);
    return Math.max(
      ...versionBible.verses
        .filter(
          (v: BibleVerse) =>
            v.book_name === normalizedBook && v.chapter === chapter,
        )
        .map((v: BibleVerse) => v.verse),
    );
  }
}

// Convenience function for one-off usage
export function getBibleVerseRange(
  version: string,
  book: string,
  chapter: number,
  verseSelector?: VerseSelector,
): BibleVerse[] {
  return new Bible(version).getVerses(book, chapter, verseSelector);
}

const normalizeBookName = (book: string): string => {
  const normalizations: Record<string, string> = {
    psalm: "Psalms",
    psalms: "Psalms",
    revelations: "Revelation",
    revelation: "Revelation",
    song: "Song of Solomon",
    songs: "Song of Solomon",
    // Add more normalizations as needed
  };

  return normalizations[book.toLowerCase()] || book;
};
