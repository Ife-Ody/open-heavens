type Version = "kjv" | "net" | "asv";

type BibleVerse = {
    book_name: string;
    book: number;
    chapter: number;
    verse: number;
    text: string;
}


interface Bible {
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