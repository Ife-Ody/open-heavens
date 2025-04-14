"use client";

import {
  MAX_FONT_SIZE,
  MIN_FONT_SIZE,
  STEP_SIZE,
} from "@/components/fontsize-selector";
import { Button } from "@repo/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { cn } from "@repo/ui/lib/utils";
import { useMemo } from "react";
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

  const maxChapter = useMemo(() => bible.getMaxChapter(book), [book]);

  const decrease = () => {
    setFontSize(Math.max(MIN_FONT_SIZE, fontSize - STEP_SIZE));
  };

  const increase = () => {
    setFontSize(Math.min(MAX_FONT_SIZE, fontSize + STEP_SIZE));
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

        <Select
          value={book}
          onValueChange={(value) => {
            setBook(value);
            setChapter(1);
            setSelectedVerses([]);
          }}
        >
          <SelectTrigger className="w-40 h-8 rounded-l-none max-w-max">
            <SelectValue placeholder="Select Book" />
          </SelectTrigger>
          <SelectContent>
            {books.map((book) => (
              <SelectItem key={book} value={book}>
                {book}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={chapter.toString()}
          onValueChange={(value) => {
            let val = parseInt(value) || 1;
            if (val > maxChapter) {
              val = maxChapter;
            }
            setChapter(val);
            setSelectedVerses([]);
          }}
        >
          <SelectTrigger className="w-20 h-8 ml-1">
            <SelectValue placeholder="Select Chapter" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: maxChapter }, (_, i) => i + 1).map(
              (chapter) => (
                <SelectItem key={chapter} value={chapter.toString()}>
                  {chapter}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
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
