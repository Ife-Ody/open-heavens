export interface BibleVerse {
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface BibleVersion {
  verses: BibleVerse[];
}

export interface VerseRange {
  start?: number;
  end?: number;
}

export type VerseSelector = number | number[] | VerseRange;

export type Version = "kjv" | "net" | "asv";

export interface Bible {
    metadata: {
        name: string;
        shortname: string;
        module?: string | null;
        year?: string | null;
        publisher?: string | null;
        owner?: string | null;
        description?: string | null;
        lang?: string | null;
        lang_short?: string | null;
        copyright?: number | null;
        copyright_statement?: string | null;
        url?: string | null;
        citation_limit?: number | null;
        restrict?: number | null;
        italics?: number | null;
        strongs?: number | null;
        red_letter?: number | null;
        paragraph?: number | null;
        official?: number | null;
        research?: number | null;
        module_version?: string | null;
    };
    verses: BibleVerse[];
}