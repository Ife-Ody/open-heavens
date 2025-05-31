'use client'
import { useBibleDialog } from '@/app/context/bible-context'
import { BOOK_NAME_MAP } from '@/lib/bible-utils'
import { useKeyboardShortcut } from '@/lib/hooks/use-keyboard-shortcut'

import { BibleVerse } from '@repo/bible'
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@repo/ui/components/command'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

const BIBLE_BOOKS = [
    'Genesis',
    'Exodus',
    'Leviticus',
    'Numbers',
    'Deuteronomy',
    'Joshua',
    'Judges',
    'Ruth',
    '1 Samuel',
    '2 Samuel',
    '1 Kings',
    '2 Kings',
    '1 Chronicles',
    '2 Chronicles',
    'Ezra',
    'Nehemiah',
    'Esther',
    'Job',
    'Psalms',
    'Proverbs',
    'Ecclesiastes',
    'Song of Solomon',
    'Isaiah',
    'Jeremiah',
    'Lamentations',
    'Ezekiel',
    'Daniel',
    'Hosea',
    'Joel',
    'Amos',
    'Obadiah',
    'Jonah',
    'Micah',
    'Nahum',
    'Habakkuk',
    'Zephaniah',
    'Haggai',
    'Zechariah',
    'Malachi',
    'Matthew',
    'Mark',
    'Luke',
    'John',
    'Acts',
    'Romans',
    '1 Corinthians',
    '2 Corinthians',
    'Galatians',
    'Ephesians',
    'Philippians',
    'Colossians',
    '1 Thessalonians',
    '2 Thessalonians',
    '1 Timothy',
    '2 Timothy',
    'Titus',
    'Philemon',
    'Hebrews',
    'James',
    '1 Peter',
    '2 Peter',
    '1 John',
    '2 John',
    '3 John',
    'Jude',
    'Revelation',
]

// Create a reverse mapping for all book names and their variants
const BOOK_VARIANTS: Record<string, string> = {
    ...BOOK_NAME_MAP,
    ...Object.fromEntries(BIBLE_BOOKS.map((book) => [book.toLowerCase(), book])),
}

type SearchState = { type: 'book_entry' } | { type: 'chapter_entry'; book: string } | { type: 'verse_entry'; book: string; chapter: number; verse?: number }

type SearchResult =
    | { type: 'empty' }
    | { type: 'books'; books: string[] }
    | { type: 'chapters'; book: string; chapters: number[] }
    | { type: 'verses'; book: string; chapter: number; verses: BibleVerse[] }
    | { type: 'chapters_and_verses'; book: string; chapters: number[]; chapterVerses: { chapter: number; verses: BibleVerse[] }[] }

function findMatchingBook(input: string): string | null {
    // Match everything up to the first number or end of string
    const bookMatch = input.match(/^([^\d]+)/)
    if (!bookMatch) return null

    const bookPart = bookMatch[1].trim().toLowerCase()

    // Find matching books
    const matchingBooks = Object.entries(BOOK_VARIANTS)
        .filter(([variant]) => variant.startsWith(bookPart))
        .map(([_, fullName]) => fullName)
        .filter((value, index, self) => self.indexOf(value) === index)

    return matchingBooks[0] ?? null
}

function parseReference(input: string, book: string, maxChapter: number): { chapter?: number; verse?: number; hasColon: boolean } {
    // Extract the part after the book name (everything after the first sequence of non-digits)
    const bookMatch = input.match(/^([^\d]+)(.*)/)
    if (!bookMatch) return { hasColon: false }
    
    const afterBook = bookMatch[2].trim()
    const hasColon = afterBook.includes(':')

    // If we have a colon, try to get the first valid chapter number from the input
    if (hasColon) {
        const [beforeColon, afterColon] = afterBook.split(':')
        const chapterMatch = beforeColon.match(/\d+/)
        const verseMatch = afterColon?.match(/\d+/)

        if (chapterMatch) {
            const chapter = parseInt(chapterMatch[0])
            if (chapter > 0 && chapter <= maxChapter) {
                return {
                    chapter,
                    verse: verseMatch ? parseInt(verseMatch[0]) : undefined,
                    hasColon,
                }
            }
        }
        // If no valid chapter found before colon, default to chapter 1
        return {
            chapter: 1,
            verse: verseMatch ? parseInt(verseMatch[0]) : undefined,
            hasColon,
        }
    }

    // No colon, just look for a number after the book part
    const chapterMatch = afterBook.match(/\d+/)
    if (chapterMatch) {
        const chapter = parseInt(chapterMatch[0])
        if (chapter > 0 && chapter <= maxChapter) {
            return { chapter, hasColon }
        }
    }

    return { hasColon }
}

export function BibleCommandSearch() {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const { bible, setBook, setChapter, setSelectedVerses, openDialog } = useBibleDialog()

    useKeyboardShortcut(['f', 's'], () => setOpen(true), { enabled: true })

    // Reset search when dialog closes
    useEffect(() => {
        if (!open) {
            setSearch('')
        }
    }, [open])

    // Determine the current search state and get the matched book
    const { searchState, matchedBook } = useMemo(() => {
        // First try to match a book
        const matchedBook = findMatchingBook(search)
        if (!matchedBook) {
            return {
                searchState: { type: 'book_entry' as const },
                matchedBook: null,
            }
        }

        // If we have a book, try to match chapter
        const maxChapter = bible.getMaxChapter(matchedBook)
        const { chapter, verse, hasColon } = parseReference(search, matchedBook, maxChapter)

        // If we have a valid chapter or see a colon, we're in verse entry
        if (chapter !== undefined || hasColon) {
            return {
                searchState: {
                    type: 'verse_entry' as const,
                    book: matchedBook,
                    chapter: chapter ?? 1,
                    verse,
                },
                matchedBook,
            }
        }

        // Otherwise we're in chapter entry
        return {
            searchState: { type: 'chapter_entry' as const, book: matchedBook },
            matchedBook,
        }
    }, [search, bible])

    // Get search results based on the current state and input
    const searchResults = useMemo((): SearchResult => {
        if (!matchedBook) {
            // If no book match, show matching books based on current input
            const bookPart = search.toLowerCase().trim()
            
            // If search is empty, show all books
            if (bookPart === '') {
                const allBooks = [...new Set(Object.values(BOOK_VARIANTS))] // Remove duplicates
                return { type: 'books', books: allBooks }
            }
            
            // Otherwise filter books based on input
            const matchingBooks = Object.entries(BOOK_VARIANTS)
                .filter(([variant]) => variant.startsWith(bookPart))
                .map(([_, fullName]) => fullName)
                .filter((value, index, self) => self.indexOf(value) === index)

            return matchingBooks.length > 0 ? { type: 'books', books: matchingBooks } : { type: 'empty' }
        }

        // If we're in chapter entry, show available chapters
        if (searchState.type === 'chapter_entry') {
            try {
                const maxChapter = bible.getMaxChapter(searchState.book)
                const chapters = Array.from({ length: maxChapter }, (_, i) => i + 1)

                // Get all chapters and their verses initially
                let chaptersToShow = chapters

                // If we have a partial chapter number, filter chapters
                const chapterMatch = search.match(/\d+$/)
                if (chapterMatch) {
                    chaptersToShow = chapters.filter((c) => c.toString().startsWith(chapterMatch[0]))
                }

                // Always show verses for the visible chapters
                if (chaptersToShow.length > 0) {
                    const chapterVerses = chaptersToShow.map((chapter) => ({
                        chapter,
                        verses: bible.getVerses(searchState.book, chapter),
                    }))

                    return {
                        type: 'chapters_and_verses',
                        book: searchState.book,
                        chapters: chaptersToShow,
                        chapterVerses,
                    }
                }

                return {
                    type: 'empty',
                }
            } catch (error) {
                console.error('Error getting max chapter:', error)
                return { type: 'empty' }
            }
        }

        // If we're in verse entry, show verses
        if (searchState.type === 'verse_entry') {
            try {
                const verses = bible.getVerses(searchState.book, searchState.chapter)
                console.log('Got verses for', searchState.book, searchState.chapter, ':', verses.length, 'verses')

                // If we have a verse number, filter verses
                if (searchState.verse !== undefined) {
                    const filteredVerses = verses.filter((v) => v.verse.toString().startsWith(searchState.verse!.toString()))
                    return {
                        type: 'verses',
                        book: searchState.book,
                        chapter: searchState.chapter,
                        verses: filteredVerses,
                    }
                }

                return {
                    type: 'verses',
                    book: searchState.book,
                    chapter: searchState.chapter,
                    verses,
                }
            } catch (error) {
                console.error('Error getting verses:', error)
                return { type: 'empty' }
            }
        }

        return { type: 'empty' }
    }, [search, bible, searchState, matchedBook])

    // Debug final results
    useEffect(() => {
        console.log('Final search state and results:', {
            search: search,
            matchedBook,
            searchState,
            searchResults,
        })
    }, [search, matchedBook, searchState, searchResults])

    const handleSelect = (book: string, chapter?: number, verse?: number) => {
        console.log('Handle select called with:', { book, chapter, verse })

        if (verse !== undefined && chapter !== undefined) {
            // Selecting a specific verse - open dialog with that verse
            setBook(book)
            setChapter(chapter)
            setSelectedVerses([verse])
            setOpen(false)
        } else if (chapter !== undefined) {
            // When selecting a chapter, set the search to show all verses
            setSearch(`${book} ${chapter}`)
            setBook(book)
            setChapter(chapter)
            setSelectedVerses([])
        } else {
            // Just selecting a book
            setSearch(`${book} `)
            setBook(book)
        }
    }

    return (
        <CommandDialog
            shouldFilter={false}
            open={open}
            onOpenChange={setOpen}
        >
            <CommandInput
                placeholder={
                    searchState.type === 'verse_entry' 
                        ? `Enter verse number (e.g., ${searchState.book} ${searchState.chapter}:1)...`
                        : searchState.type === 'chapter_entry' 
                        ? `Enter chapter number (e.g., ${searchState.book} 1)...`
                        : `Search for a book (e.g., 'gen' for Genesis)...`
                }
                value={search}
                onValueChange={setSearch}
            />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>

                {searchResults.type === 'books' && (
                    <CommandGroup heading="Books">
                        {searchResults.books.map((book) => (
                            <CommandItem
                                key={`book-${book}`}
                                onSelect={() => handleSelect(book)}
                            >
                                {book}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}

                {searchResults.type === 'chapters' && (
                    <CommandGroup heading={`Chapters in ${searchResults.book}`}>
                        {searchResults.chapters.map((chapterNum) => (
                            <CommandItem
                                key={`chapter-${searchResults.book}-${chapterNum}`}
                                onSelect={() => handleSelect(searchResults.book, chapterNum)}
                            >
                                {`${searchResults.book} ${chapterNum}`}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}

                {searchResults.type === 'verses' && (
                    <>
                        <CommandGroup heading="Chapter">
                            <CommandItem
                                key={`chapter-${searchResults.book}-${searchResults.chapter}-all`}
                                onSelect={() => handleSelect(searchResults.book, searchResults.chapter)}
                            >
                                <div className="flex flex-col">
                                    <span>{`${searchResults.book} ${searchResults.chapter}`}</span>
                                    <span className="text-sm text-muted-foreground">View entire chapter</span>
                                </div>
                            </CommandItem>
                        </CommandGroup>
                        <CommandGroup heading={`Verses in ${searchResults.book} ${searchResults.chapter}`}>
                            {searchResults.verses.map((verse) => (
                                <CommandItem
                                    key={`verse-${searchResults.book}-${searchResults.chapter}-${verse.verse}`}
                                    value={`${searchResults.book} ${searchResults.chapter}:${verse.verse}`}
                                    onSelect={() => handleSelect(searchResults.book, searchResults.chapter, verse.verse)}
                                >
                                    <div className="flex flex-col">
                                        <span>{`${searchResults.book} ${searchResults.chapter}:${verse.verse}`}</span>
                                        <span className="text-sm text-muted-foreground">{verse.text}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </>
                )}

                {searchResults.type === 'chapters_and_verses' && (
                    <>
                        <CommandGroup heading={`Chapters in ${searchResults.book}`}>
                            {searchResults.chapters.map((chapterNum) => (
                                <CommandItem
                                    key={`chapter-${searchResults.book}-${chapterNum}`}
                                    onSelect={() => handleSelect(searchResults.book, chapterNum)}
                                >
                                    {`${searchResults.book} ${chapterNum}`}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        {searchResults.chapterVerses.map(({ chapter, verses }) => (
                            <CommandGroup
                                key={`verses-${chapter}`}
                                heading={`Verses in ${searchResults.book} ${chapter}`}
                            >
                                {verses.map((verse) => (
                                    <CommandItem
                                        key={`verse-${searchResults.book}-${chapter}-${verse.verse}`}
                                        onSelect={() => handleSelect(searchResults.book, chapter, verse.verse)}
                                    >
                                        <div className="flex flex-col">
                                            <span>{`${searchResults.book} ${chapter}:${verse.verse}`}</span>
                                            <span className="text-sm text-muted-foreground">{verse.text}</span>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        ))}
                    </>
                )}
            </CommandList>
        </CommandDialog>
    )
}
