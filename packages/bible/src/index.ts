import { versions } from './en'
import type { BibleVerse, VerseSelector } from './types'

export type { BibleVerse, BibleVersion, VerseRange, VerseSelector } from './types'

export class Bible {
    version: string = 'kjv'

    constructor(version: string = 'kjv') {
        this.setVersion(version)
    }

    setVersion(version: string): Bible {
        if (!versions[version as keyof typeof versions]) {
            throw new Error(`Version ${version} not found`)
        }
        this.version = version
        return this
    }

    getVerses(book: string, chapter: number, verseSelector?: VerseSelector): BibleVerse[] {
        const versionBible = versions[this.version as keyof typeof versions]

        if (!book || !chapter) {
            throw new Error('Book and chapter are required')
        }

        const verses = versionBible.verses.filter((verse: BibleVerse) => verse.book_name === book && verse.chapter === chapter)

        if (verses.length === 0) {
            throw new Error(`No verses found for ${book} ${chapter}`)
        }

        if (!verseSelector) {
            return verses
        }

        // Handle different verse selection formats
        if (typeof verseSelector === 'number') {
            return verses.filter((v: BibleVerse) => v.verse === verseSelector)
        }

        if (Array.isArray(verseSelector)) {
            return verses.filter((v: BibleVerse) => verseSelector.includes(v.verse))
        }

        // Handle verse range
        const { start = 1, end = Math.max(...verses.map((v: BibleVerse) => v.verse)) } = verseSelector
        return verses.filter((v: BibleVerse) => v.verse >= start && v.verse <= end)
    }

    getMaxChapter(book: string): number {
        const versionBible = versions[this.version as keyof typeof versions]
        return Math.max(...versionBible.verses.filter((v: BibleVerse) => v.book_name === book).map((v: BibleVerse) => v.chapter))
    }
}

// Convenience function for one-off usage
export function getBibleVerseRange(version: string, book: string, chapter: number, verseSelector?: VerseSelector): BibleVerse[] {
    return new Bible(version).getVerses(book, chapter, verseSelector)
}
