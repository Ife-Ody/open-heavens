import { versions } from './en'

function getBibleVerseRange(version: string, book: string, chapter: number, verses?: number[]) {
    if (!version) {
        version = "kjv";
    }

    const versionBible = versions[version as keyof typeof versions]

    if (!versionBible) {
        throw new Error(`Version ${version} not found`)
    }

    if (!book) {
        book = "Genesis";
    }

    if (!chapter) {
        chapter = 1;
    }

    if (!verses) {
        verses = [];
    }

    const bibleVerses = versionBible.verses.filter((verse) => verse.book_name === book && verse.chapter === chapter && (verses.length === 0 || verses.includes(verse.verse)))

    return bibleVerses
}

export { getBibleVerseRange }
