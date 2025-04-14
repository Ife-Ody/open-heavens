"use client";

import { Bible, BibleVerse } from "@repo/bible";
import { createContext, useContext, useMemo, useState } from "react";
import { BibleDialog } from "../bible/components/bible-dialog";
interface BibleContextType {
  bible: Bible;
  loading: boolean;
  isOpen: boolean;
  openDialog: () => void;
  closeDialog: () => void;
  book: string;
  setBook: (book: string) => void;
  chapter: number;
  setChapter: (chapter: number) => void;
  version: string;
  setVersion: (version: string) => void;
  selectedVerses: number[];
  setSelectedVerses: (verses: number[]) => void;
  verses: BibleVerse[];
}

const BibleContext = createContext<BibleContextType | undefined>(undefined);

export function BibleProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [book, setBook] = useState("Genesis");
  const [chapter, setChapter] = useState(1);
  const [version, setVersion] = useState("kjv");
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);
  const bible = new Bible(version);

  const verses = useMemo(() => {
    if (!book || !chapter) return [];

    const allVerses = bible?.getVerses(book, chapter, selectedVerses);

    return allVerses;
  }, [bible, book, chapter, selectedVerses]);

  const value = {
    bible,
    loading,
    isOpen,
    openDialog: () => setIsOpen(true),
    closeDialog: () => setIsOpen(false),
    book,
    setBook,
    chapter,
    setChapter,
    version,
    setVersion,
    selectedVerses,
    setSelectedVerses,
    verses,
  };

  return (
    <BibleContext.Provider value={value}>
      <BibleDialog open={isOpen} onOpenChange={setIsOpen}>
        {children}
      </BibleDialog>
    </BibleContext.Provider>
  );
}

export function useBibleDialog() {
  const context = useContext(BibleContext);
  if (context === undefined) {
    throw new Error("useBible must be used within a BibleProvider");
  }
  return context;
}
