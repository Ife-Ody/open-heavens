// Comprehensive list of Bible book names and their abbreviations
export const BIBLE_BOOKS_PATTERN =
  "Genesis|Gen|Ge|Gn|Exodus|Ex|Exod?|Leviticus|Lev?|Lv|Levit?|Numbers|" +
  "Nu|Nm|Hb|Nmb|Numb?|Deuteronomy|Deut?|De|Dt|Joshua|Josh?|Jsh|Judges|Jdgs?|Judg?|Jd|Ruth|Ru|Rth|" +
  "(?:1|2|First|Second)\\s*Samuel|Sam?|Sml|(?:1|2|First|Second)\\s*Kings|Kngs?|Kgs|Kin?|" +
  "(?:1|2|First|Second)\\s*Chronicles|Chr?|Chron|Ezra|Ez|" +
  "Nehemiah|Nehem?|Ne|Esther|Esth?|Es|Job|Jb|Psalms?|Psa?|Pss|Psm|Proverbs?|Prov?|Prv|Pr|" +
  "Ecclesiastes|Eccl?|Eccles|Ecc?|Song\\s*of\\s*Solomon|Songs?\\s*of\\s*Solomon|Song?|So|Songs|Isaiah|Isa|Is|Jeremiah|" +
  "Jer?|Jr|Jerem|Lamentations|Lam|Lament?|Ezekiel|Ezek?|Ezk|Daniel|Dan?|Dn|Hosea|" +
  "Hos?|Joel|Jo|Amos|Am|Obadiah|Obad?|Ob|Jonah|Jon|Jnh|Micah|Mi?c|Nahum|Nah?|" +
  "Habakkuk|Ha?b|Habak|Zephaniah|Ze?ph?|Haggai|Ha?g|Hagg|Zechariah|Zech?|Ze?c|" +
  "Malachi|Malac?|Ma?l|Mat{1,2}hew|Mat?|Matt?|Mt|Mark?|Mrk?|Mk|Luke|Lu?k|Lk|John?|Jhn|Jo|Jn|" +
  "Acts?|Ac|Romans|Rom?|Rm|" +
  "(?:1|2|First|Second)\\s*Corinthians|Cor?|Corin|Galatians|Gal?|Galat|" +
  "Ephesians|Eph|Ephes|Philippians|Phili?|Php|Pp|Colossians|Col?|Colos|" +
  "(?:1|2|First|Second)\\s*Thessalonians|Thess?|Th|(?:1|2|First|Second)\\s*Timothy|Tim?|Titus|Tts|Tit?|Philemon|Phm?|Philem|Pm|" +
  "Hebrews|Hebr?|James|Jam|Jms?|Jas|(?:1|2|First|Second)\\s*Peter|Pete?|Pe|Pt|" +
  "(?:1|2|3|First|Second|Third)\\s*John?|Jhn|Jo|Jn|Jude?|Jd|Ju|Revelations?|Rev?|Revel";

// Volume prefixes for Bible books
export const VOLUME_PREFIXES = "I+|1st|2nd|3rd|First|Second|Third|1|2|3";

// A map of book name variants to their canonical names
export const BOOK_NAME_MAP: Record<string, string> = {
  // Old Testament
  gen: "Genesis",
  ge: "Genesis",
  gn: "Genesis",
  ex: "Exodus",
  exod: "Exodus",
  exo: "Exodus",
  lev: "Leviticus",
  le: "Leviticus",
  lv: "Leviticus",
  levit: "Leviticus",
  num: "Numbers",
  nu: "Numbers",
  nm: "Numbers",
  hb: "Numbers",
  nmb: "Numbers",
  numb: "Numbers",
  deut: "Deuteronomy",
  deu: "Deuteronomy",
  de: "Deuteronomy",
  dt: "Deuteronomy",
  josh: "Joshua",
  jos: "Joshua",
  jsh: "Joshua",
  jdgs: "Judges",
  judg: "Judges",
  jdg: "Judges",
  jd: "Judges",
  ru: "Ruth",
  rth: "Ruth",
  "1 sam": "1 Samuel",
  "1 sa": "1 Samuel",
  "1 samuel": "1 Samuel",
  "first samuel": "1 Samuel",
  "1sam": "1 Samuel",
  "1sa": "1 Samuel",
  "2 sam": "2 Samuel",
  "2 sa": "2 Samuel",
  "2 samuel": "2 Samuel",
  "second samuel": "2 Samuel",
  "2sam": "2 Samuel",
  "2sa": "2 Samuel",
  // ... add more mappings as needed
};

export interface ParsedReference {
  book: string;
  startChapter: number;
  endChapter: number;
  startVerse?: number;
  endVerse?: number;
  selectedVerses?: number[];
}

/**
 * Create a regex that matches Bible references
 * @param includeCapture Whether to include capturing groups in the regex
 * @returns RegExp that matches Bible references
 */
export function getBibleReferenceRegex(
  includeCapture: boolean = false,
): RegExp {
  const vols = VOLUME_PREFIXES;
  const books = BIBLE_BOOKS_PATTERN;

  // Pattern to match book name with optional volume prefix
  const bookPattern = includeCapture
    ? `((?:(${vols})\\s?)?(${books})\\.?\\s?)`
    : `(?:(?:${vols})\\s?)?(?:${books})\\.?\\s?`;

  // Pattern to match chapter:verse with various separators and combinations
  const versePattern = `\\d+(?::\\d+(?:(?:\\s*[-–—]\\s*\\d+(?::\\d+)?)|(?:\\s*,\\s*\\d+))*)?`;

  return new RegExp(`\\b${bookPattern}${versePattern}\\b`, "gm");
}

/**
 * Parse a Bible reference string into its component parts
 * @param reference A Bible reference string like "John 3:16" or "Psalm 119:105-110"
 * @returns An object containing the parsed reference parts or null if parsing failed
 */
export function parseBibleReference(reference: string): ParsedReference | null {
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
      const parts = passage.split(",").map((p) => p.trim());
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

          if (
            verseStr.includes("-") ||
            verseStr.includes("–") ||
            verseStr.includes("—")
          ) {
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
        } else if (
          part.includes("-") ||
          part.includes("–") ||
          part.includes("—")
        ) {
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
          selectedVerses: allVerses,
        };
      }
    }

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
}

/**
 * Extract all selected verses from a reference string
 * @param reference Bible reference string
 * @param parsedRef Already parsed reference (optional, to avoid parsing twice)
 * @returns Array of verse numbers
 */
export function extractSelectedVerses(
  reference: string,
  parsedRef?: ParsedReference | null,
): number[] {
  // If we already have the parsed reference with selected verses, return them
  if (parsedRef?.selectedVerses) {
    return parsedRef.selectedVerses;
  }

  // Otherwise, parse the reference
  const parsed = parsedRef || parseBibleReference(reference);
  if (!parsed) return [];

  // If we have a straightforward verse range
  if (parsed.startVerse !== undefined && parsed.endVerse !== undefined) {
    // Check if the original reference contains commas, which indicates specific verses
    if (reference.includes(",")) {
      const verses: number[] = [];

      // Extract the verse part from the reference (everything after the book and chapter)
      const bookAndChapterMatch = reference.match(/^(.*?\d+):/);
      if (bookAndChapterMatch) {
        const versePart = reference.substring(bookAndChapterMatch[0].length);

        // Split by commas and process each part
        const parts = versePart.split(",").map((p) => p.trim());

        for (const part of parts) {
          if (part.match(/[-–—]/)) {
            // Handle ranges like "5-7"
            const [start, end] = part
              .split(/[-–—]/)
              .map((v) => parseInt(v.trim(), 10));
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
        return verses;
      }
    }

    // For non-comma references or as fallback
    const startVerse = parsed.startVerse;
    const endVerse = parsed.endVerse;
    const verses = [];
    for (let v = startVerse; v <= endVerse; v++) {
      verses.push(v);
    }
    return verses;
  }

  return [];
}

/**
 * Normalize a Bible book name to its canonical form
 * @param bookName A Bible book name or abbreviation
 * @returns The canonical book name
 */
export function normalizeBookName(bookName: string): string {
  // Convert to lowercase, trim, and normalize spaces for consistent matching
  const normalizedName = bookName.toLowerCase().trim().replace(/\s+/g, " ");

  // Check if it's in our map of variants
  if (BOOK_NAME_MAP[normalizedName]) {
    return BOOK_NAME_MAP[normalizedName];
  }

  // If not in the map, use some basic rules to normalize
  // Handle numbered books like "1 john" -> "1 John"
  if (/^\d\s*[a-z]/.test(normalizedName)) {
    const [num, ...nameParts] = normalizedName.split(/\s+/);
    const name = nameParts.join(" ");
    // Capitalize first letter of the name part
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
    return `${num} ${capitalizedName}`;
  }

  // For other cases, just capitalize the first letter of each word
  return normalizedName
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Extracts all Bible references from a block of text
 * @param text Text that may contain Bible references
 * @returns Array of Bible reference strings
 */
export function extractBibleReferences(text: string): string[] {
  const regex = getBibleReferenceRegex();
  const matches = text.match(regex);
  return matches ? [...new Set(matches)] : [];
}
