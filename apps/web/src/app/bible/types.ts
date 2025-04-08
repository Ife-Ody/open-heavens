type Version = "kjv" | "net" | "asv";

type BibleVerse = {
  book_name: string;
  book: number;
  chapter: number;
  verse: number;
  text: string;
};

interface Bible {
  metadata: {
    name: string;
    shortname: string;
    module: string;
    year: string;
    publisher: string | null;
    owner: string | null;
    description: string | null;
    lang: string;
    lang_short: string;
    copyright: number;
    copyright_statement: string;
    url: string | null;
    citation_limit: number;
    restrict: number;
    italics: number;
    strongs: number;
    red_letter: number;
    paragraph: number;
    official: number;
    research: number;
    module_version: string;
  };
  verses: BibleVerse[];
}
