"use client";

import {
  MAX_FONT_SIZE,
  MIN_FONT_SIZE,
  STEP_SIZE,
} from "@/components/fontsize-selector";
import { Button } from "@repo/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { cn } from "@repo/ui/lib/utils";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useBibleDialog } from "@/app/context/bible-context";
import { useSettings } from "@/app/context/settings-context";

const versions = ["kjv", "net", "asv"] as const;

const books = [
  "Genesis",
  "Exodus",
  "Leviticus",
  "Numbers",
  "Deuteronomy",
  "Joshua",
  "Judges",
  "Ruth",
  "1 Samuel",
  "2 Samuel",
  "1 Kings",
  "2 Kings",
  "1 Chronicles",
  "2 Chronicles",
  "Ezra",
  "Nehemiah",
  "Esther",
  "Job",
  "Psalms",
  "Proverbs",
  "Ecclesiastes",
  "Song of Solomon",
  "Isaiah",
  "Jeremiah",
  "Lamentations",
  "Ezekiel",
  "Daniel",
  "Hosea",
  "Joel",
  "Amos",
  "Obadiah",
  "Jonah",
  "Micah",
  "Nahum",
  "Habakkuk",
  "Zephaniah",
  "Haggai",
  "Zechariah",
  "Malachi",
  "Matthew",
  "Mark",
  "Luke",
  "John",
  "Acts",
  "Romans",
  "1 Corinthians",
  "2 Corinthians",
  "Galatians",
  "Ephesians",
  "Philippians",
  "Colossians",
  "1 Thessalonians",
  "2 Thessalonians",
  "1 Timothy",
  "2 Timothy",
  "Titus",
  "Philemon",
  "Hebrews",
  "James",
  "1 Peter",
  "2 Peter",
  "1 John",
  "2 John",
  "3 John",
  "Jude",
  "Revelation",
] as const;

type SelectorMode = "book-and-chapter" | "chapter-only";
type SelectorStep = "book" | "chapter";

function ChapterGrid({
  maxChapter,
  selectedChapter,
  onSelectChapter,
}: {
  maxChapter: number;
  selectedChapter: number;
  onSelectChapter: (chapter: number) => void;
}) {
  const chapters = Array.from({ length: maxChapter }, (_, index) => index + 1);

  return (
    <div className="grid grid-cols-5 border-t border-l">
      {chapters.map((chapter) => (
        <button
          key={chapter}
          type="button"
          className={cn(
            "h-14 border-r border-b text-lg transition-colors hover:bg-accent/70",
            selectedChapter === chapter && "bg-accent/50",
          )}
          onClick={() => onSelectChapter(chapter)}
        >
          {chapter}
        </button>
      ))}
    </div>
  );
}

function SelectorHeader({
  title,
  showBack,
  onBack,
  onClose,
}: {
  title: string;
  showBack: boolean;
  onBack?: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b bg-muted/40">
      <div className="w-10">
        {showBack ? (
          <button
            type="button"
            onClick={onBack}
            className="flex h-12 w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Back to books"
          >
            <ArrowLeft className="size-4" />
          </button>
        ) : null}
      </div>
      <p className="text-sm font-semibold uppercase tracking-wide">{title}</p>
      <button
        type="button"
        onClick={onClose}
        className="h-12 px-3 text-sm font-medium uppercase text-muted-foreground transition-colors hover:text-foreground"
      >
        Cancel
      </button>
    </div>
  );
}

function BookChapterPopoverContent({
  mode,
  initialBook,
  initialChapter,
  onComplete,
  onClose,
  getMaxChapter,
}: {
  mode: SelectorMode;
  initialBook: string;
  initialChapter: number;
  onComplete: (book: string, chapter: number) => void;
  onClose: () => void;
  getMaxChapter: (book: string) => number;
}) {
  const [step, setStep] = useState<SelectorStep>(
    mode === "book-and-chapter" ? "book" : "chapter",
  );
  const [selectedBook, setSelectedBook] = useState(initialBook);

  const maxChapter = getMaxChapter(selectedBook);
  const selectedChapter = Math.min(
    selectedBook === initialBook ? initialChapter : 1,
    maxChapter,
  );

  const handleSelectChapter = (chapter: number) => {
    onComplete(selectedBook, chapter);
  };

  if (step === "book") {
    return (
      <div className="p-0">
        <SelectorHeader
          title="Book"
          showBack={false}
          onClose={onClose}
        />
        <ScrollArea className="h-80">
          <div className="divide-y">
            {books.map((bookName) => (
              <button
                key={bookName}
                type="button"
                className={cn(
                  "w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-accent",
                  selectedBook === bookName && "bg-accent/40",
                )}
                onClick={() => {
                  setSelectedBook(bookName);
                  setStep("chapter");
                }}
              >
                {bookName}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="p-0">
      <SelectorHeader
        title="Chapter"
        showBack={mode === "book-and-chapter"}
        onBack={() => setStep("book")}
        onClose={onClose}
      />
      <ChapterGrid
        maxChapter={maxChapter}
        selectedChapter={selectedChapter}
        onSelectChapter={handleSelectChapter}
      />
    </div>
  );
}

export function BibleHeader({ className }: { className?: string }) {
  const {
    bible,
    book,
    chapter,
    setVersion,
    setChapter,
    setBook,
    setSelectedVerses,
  } = useBibleDialog();
  const { fontSize, setFontSize } = useSettings();
  const [bookPopoverOpen, setBookPopoverOpen] = useState(false);
  const [chapterPopoverOpen, setChapterPopoverOpen] = useState(false);

  const decrease = () => {
    setFontSize(Math.max(MIN_FONT_SIZE, fontSize - STEP_SIZE));
  };

  const increase = () => {
    setFontSize(Math.min(MAX_FONT_SIZE, fontSize + STEP_SIZE));
  };

  const handleReferenceChange = (nextBook: string, nextChapter: number) => {
    const safeChapter = Math.min(
      Math.max(nextChapter, 1),
      bible.getMaxChapter(nextBook),
    );
    setBook(nextBook);
    setChapter(safeChapter);
    setSelectedVerses([]);
  };

  return (
    <div
      className={cn(
        "flex items-center flex-col sm:flex-row justify-between p-2 sm:pb-0 gap-4",
        className,
      )}
    >
      <div className="flex items-center">
        <Select
          value={bible.version}
          onValueChange={(value) => {
            setVersion(value);
          }}
        >
          <SelectTrigger className="w-20 h-8 rounded-r-none max-w-max">
            <SelectValue placeholder="Select Version" />
          </SelectTrigger>
          <SelectContent>
            {versions.map((v) => (
              <SelectItem key={v} value={v}>
                {v.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover open={bookPopoverOpen} onOpenChange={setBookPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-40 rounded-l-none justify-between font-normal"
            >
              {book}
              <ChevronDown className="size-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[min(95vw,30rem)] p-0" align="start">
            <BookChapterPopoverContent
              mode="book-and-chapter"
              initialBook={book}
              initialChapter={chapter}
              getMaxChapter={(bookName) => bible.getMaxChapter(bookName)}
              onClose={() => setBookPopoverOpen(false)}
              onComplete={(nextBook, nextChapter) => {
                handleReferenceChange(nextBook, nextChapter);
                setBookPopoverOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>

        <Popover open={chapterPopoverOpen} onOpenChange={setChapterPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="ml-1 h-8 w-20 justify-between font-normal"
            >
              {chapter}
              <ChevronDown className="size-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[min(95vw,30rem)] p-0" align="start">
            <BookChapterPopoverContent
              mode="chapter-only"
              initialBook={book}
              initialChapter={chapter}
              getMaxChapter={(bookName) => bible.getMaxChapter(bookName)}
              onClose={() => setChapterPopoverOpen(false)}
              onComplete={(_, nextChapter) => {
                handleReferenceChange(book, nextChapter);
                setChapterPopoverOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="items-center hidden gap-4 sm:flex">
        <Button
          onClick={decrease}
          size="icon"
          className="w-8 h-8"
          variant="ghost"
        >
          A-
        </Button>
        <span className="text-sm">{fontSize}px</span>
        <Button
          onClick={increase}
          variant="ghost"
          size="icon"
          className="w-8 h-8"
        >
          A+
        </Button>
      </div>
    </div>
  );
}
