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

const BOOK_ALIAS_MAP = createBookAliasMap();

function normalizeBookLookupKey(book: string): string {
  return book
    .normalize("NFKC")
    .trim()
    .replace(/^(first|1st|i)\b\.?/i, "1")
    .replace(/^(second|2nd|ii)\b\.?/i, "2")
    .replace(/^(third|3rd|iii)\b\.?/i, "3")
    .replace(/[.]/g, " ")
    .replace(/^([123])([a-z])/i, "$1 $2")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function toTitleCase(value: string): string {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function createBookAliasMap(): Record<string, string> {
  const map: Record<string, string> = {};

  const add = (canonical: string, aliases: string[]) => {
    for (const alias of [canonical, ...aliases]) {
      map[normalizeBookLookupKey(alias)] = canonical;
    }
  };

  add("Genesis", ["gen", "ge", "gn"]);
  add("Exodus", ["exo", "exod", "ex"]);
  add("Leviticus", ["lev", "levit", "lv"]);
  add("Numbers", ["num", "numb", "nu", "nm", "nmb"]);
  add("Deuteronomy", ["deut", "deu", "dt", "de"]);
  add("Joshua", ["josh", "jos", "jsh"]);
  add("Judges", ["judg", "jdg", "jdgs", "jug", "jud"]);
  add("Ruth", ["rth", "rut", "ru"]);
  add("1 Samuel", ["1 sam", "1sam", "1 sa", "1sa", "1samuel"]);
  add("2 Samuel", ["2 sam", "2sam", "2 sa", "2sa", "2samuel"]);
  add("1 Kings", ["1 kings", "1kings", "1 kgs", "1kgs", "1 ki", "1ki"]);
  add("2 Kings", ["2 kings", "2kings", "2 kgs", "2kgs", "2 ki", "2ki"]);
  add("1 Chronicles", ["1 chronicles", "1chronicles", "1 chr", "1chr", "1 chro", "1chro"]);
  add("2 Chronicles", ["2 chronicles", "2chronicles", "2 chr", "2chr", "2 chro", "2chro"]);
  add("Ezra", ["ezr", "ez"]);
  add("Nehemiah", ["neh", "nehem", "ne"]);
  add("Esther", ["esth", "est", "es"]);
  add("Job", ["jb"]);
  add("Psalms", ["ps", "psa", "psalm", "psalms", "psm", "pss"]);
  add("Proverbs", ["prov", "pro", "prv", "pr"]);
  add("Ecclesiastes", ["eccl", "ecc", "eccles"]);
  add("Song of Solomon", ["song", "songs", "song of songs", "sos", "canticles"]);
  add("Isaiah", ["isa", "isai", "is"]);
  add("Jeremiah", ["jer", "jr", "jerem"]);
  add("Lamentations", ["lam", "lamentation"]);
  add("Ezekiel", ["ezek", "ezk", "eze"]);
  add("Daniel", ["dan", "dn"]);
  add("Hosea", ["hos", "ho"]);
  add("Joel", ["joe", "jl"]);
  add("Amos", ["amo", "am"]);
  add("Obadiah", ["obad", "ob"]);
  add("Jonah", ["jon", "jnh"]);
  add("Micah", ["mic", "mi"]);
  add("Nahum", ["nah", "na"]);
  add("Habakkuk", ["hab", "hb"]);
  add("Zephaniah", ["zeph", "zep", "zp"]);
  add("Haggai", ["hag", "hg"]);
  add("Zechariah", ["zech", "zec", "zc"]);
  add("Malachi", ["mal", "ml"]);
  add("Matthew", ["matt", "mat", "mt"]);
  add("Mark", ["mrk", "mar", "mk", "mr"]);
  add("Luke", ["luk", "lk", "lu"]);
  add("John", ["jhn", "joh", "jn"]);
  add("Acts", ["act", "ac"]);
  add("Romans", ["rom", "rm", "ro"]);
  add("1 Corinthians", ["1 cor", "1cor", "1 co", "1co", "1corinthians"]);
  add("2 Corinthians", ["2 cor", "2cor", "2 co", "2co", "2corinthians"]);
  add("Galatians", ["gal", "galat", "ga"]);
  add("Ephesians", ["eph", "ephes", "ep"]);
  add("Philippians", ["phil", "php", "phl", "phi"]);
  add("Colossians", ["col", "colos"]);
  add("1 Thessalonians", ["1 thess", "1thess", "1 thes", "1thes", "1 th"]);
  add("2 Thessalonians", ["2 thess", "2thess", "2 thes", "2thes", "2 th"]);
  add("1 Timothy", ["1 tim", "1tim", "1 ti", "1ti"]);
  add("2 Timothy", ["2 tim", "2tim", "2 ti", "2ti"]);
  add("Titus", ["tit", "tts", "ti"]);
  add("Philemon", ["phm", "philem", "pm"]);
  add("Hebrews", ["heb", "hebr"]);
  add("James", ["jam", "jas", "jms"]);
  add("1 Peter", ["1 pet", "1pet", "1 pe", "1pe", "1 pt", "1pt"]);
  add("2 Peter", ["2 pet", "2pet", "2 pe", "2pe", "2 pt", "2pt"]);
  add("1 John", ["1 john", "1john", "1 jn", "1jn", "1 jhn", "1jhn"]);
  add("2 John", ["2 john", "2john", "2 jn", "2jn", "2 jhn", "2jhn"]);
  add("3 John", ["3 john", "3john", "3 jn", "3jn", "3 jhn", "3jhn"]);
  add("Jude", ["jud", "jd", "ju"]);
  add("Revelation", ["rev", "revelations", "revelation", "rv", "apocalypse"]);

  return map;
}

const normalizeBookName = (book: string): string => {
  const key = normalizeBookLookupKey(book);
  const canonical = BOOK_ALIAS_MAP[key];
  if (canonical) {
    return canonical;
  }

  const numberedBookMatch = key.match(/^([123])\s+(.+)$/);
  if (numberedBookMatch) {
    const [, number, name] = numberedBookMatch;
    return `${number} ${toTitleCase(name)}`;
  }

  return toTitleCase(key);
};
