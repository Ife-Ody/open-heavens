"use client";

import { useBible } from "../../context/bible-context";
import { useSettings } from "../../context/settings-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Input } from "@repo/ui/components/input";
import { Button } from "@repo/ui/components/button";

const versions = ["kjv", "net", "asv"] as const;

const books = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
  "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra",
  "Nehemiah", "Esther", "Job", "Psalms", "Proverbs",
  "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations",
  "Ezekiel", "Daniel", "Hosea", "Joel", "Amos",
  "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk",
  "Zephaniah", "Haggai", "Zechariah", "Malachi",
  "Matthew", "Mark", "Luke", "John", "Acts",
  "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians",
  "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians",
  "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews",
  "James", "1 Peter", "2 Peter", "1 John", "2 John",
  "3 John", "Jude", "Revelation"
] as const;

export function BibleHeader() {
  const { currentBook, currentChapter, bible, setVersion, setChapter, setBook } =
    useBible();
  const { fontSize, setFontSize } = useSettings();

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-6">
        <Select
          value={bible.version}
          onValueChange={(value) => {
            setVersion(value);
          }}
        >
          <SelectTrigger className="w-24">
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

        <div className="flex items-center gap-2">
          <Select
            value={currentBook}
            onValueChange={setBook}
          >
            <SelectTrigger className="w-40">
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

          <Input
            type="number"
            value={currentChapter}
            onChange={(e) => setChapter(parseInt(e.target.value) || 1)}
            className="w-16"
            min={1}
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Button
          onClick={() => setFontSize((fontSize || 16) - 2)}
          size="icon"
          variant="ghost"
        >
          A-
        </Button>
        <span className="text-sm">{fontSize}px</span>
        <Button
          onClick={() => setFontSize((fontSize || 16) + 2)}
          variant="ghost"
          size="icon"
        >
          A+
        </Button>
      </div>
    </div>
  );
}
