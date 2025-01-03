"use client";

import FontsizeSelector from "@/components/fontsize-selector";
import { Button } from "@repo/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { ChevronLeft, ChevronRight, Headphones } from "lucide-react";
import * as React from "react";
import { useSettings } from "../context/settings-context";
import { getBibleVerseRange } from "@repo/bible";
import { useState } from "react";
// This would come from your data source

export default function BibleReader() {
  const { fontSize } = useSettings();
  const [selectedBook, setSelectedBook] = useState("John");
  const [selectedChapter, setSelectedChapter] = useState("1");

  const bibleText = getBibleVerseRange("kjv", "John", 1) as BibleVerse[];

  if (!bibleText) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-full max-w-3xl p-4 mx-auto space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center flex-1 gap-2">
          <VersionSelector />
          <BookSelector
            options={["John", "Mark", "Luke", "Matthew"]}
            selectedBook={selectedBook}
            setSelectedBook={setSelectedBook}
          />
          <ChapterSelector
            options={["1", "2", "3"]}
            selectedChapter={selectedChapter}
            setSelectedChapter={setSelectedChapter}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Headphones className="w-4 h-4" />
          </Button>
          <FontsizeSelector sample={false} />
        </div>
      </div>

      {/* Bible Content */}
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-center">
          {bibleText[0].book_name} {bibleText[0].chapter}
        </h1>
        {/* <h2 className="text-xl text-center">{bibleText[0].book_name}</h2> */}

        <div className={`space-y-4 text-[${fontSize}px]`}>
          {bibleText.map((verse, index) => (
            <p key={index} className="leading-relaxed">
              <sup className="mr-1 text-xs font-medium text-gray-500">
                {verse.verse}
              </sup>
              {verse.text}
            </p>
          ))}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="ghost" size="icon">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

const VersionSelector = () => {
  const { version, setVersion } = useSettings();

  return (
    <Select value={version} onValueChange={setVersion}>
      <SelectTrigger className="w-[120px]">
        <SelectValue placeholder="Version" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="kjv">KJV</SelectItem>
        <SelectItem value="net">NET</SelectItem>
        <SelectItem value="asv">ASV</SelectItem>
      </SelectContent>
    </Select>
  );
};

const BookSelector = ({
  options,
  selectedBook,
  setSelectedBook,
}: {
  options: string[];
  selectedBook: string;
  setSelectedBook: (book: string) => void;
}) => {
  return (
    <Select value={selectedBook} onValueChange={setSelectedBook}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select book" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const ChapterSelector = ({
  options,
  selectedChapter,
  setSelectedChapter,
}: {
  options: string[];
  selectedChapter: string;
  setSelectedChapter: (chapter: string) => void;
}) => {
  return (
    <Select value={selectedChapter} onValueChange={setSelectedChapter}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select chapter" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
