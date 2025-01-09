"use client";

import { Bible, BibleVerse } from "@repo/bible";
import { createContext, useContext, useEffect, useState } from "react";
import { BibleDialog } from "../bible/bible-dialog";

interface BibleContextType {
  bible: Bible;
  currentBook: string;
  currentChapter: number;
  currentVerses: BibleVerse[];
  setBook: (book: string) => void;
  setChapter: (chapter: number) => void;
  setVersion: (version: string) => void;
  loadVerses: (verseSelector?: number | number[]) => void;
  loading: boolean;
  openDialog: () => void;
}

const BibleContext = createContext<BibleContextType | undefined>(undefined);

export function BibleProvider({ children }: { children: React.ReactNode }) {
  const [bible] = useState(() => new Bible("kjv"));
  const [currentBook, setCurrentBook] = useState("Genesis");
  const [currentChapter, setCurrentChapter] = useState(1);
  const [currentVerses, setCurrentVerses] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadVerses();
  }, [currentBook, currentChapter]);

  const setBook = (book: string) => {
    setCurrentBook(book);
    setCurrentChapter(1);
    loadVerses();
  };

  const setChapter = async (chapter: number) => {
    setLoading(true);
    setCurrentChapter(chapter);
    loadVerses();
  };

  const setVersion = (version: string) => {
    bible.setVersion(version);
    loadVerses();
  };

  const loadVerses = (verseSelector?: number | number[]) => {
    try {
      const verses = bible.getVerses(
        currentBook,
        currentChapter,
        verseSelector,
      );
      setCurrentVerses(verses);
    } catch (error) {
      console.error("Error loading verses:", error);
      setCurrentVerses([]);
    } finally {
      setLoading(false);
    }
  };

  const openDialog = () => {
    setDialogOpen(true);
  };

  return (
    <BibleContext.Provider
      value={{
        bible,
        currentBook,
        currentChapter,
        currentVerses,
        setBook,
        setChapter,
        setVersion,
        loadVerses,
        loading,
        openDialog,
      }}
    >
      <BibleDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {children}
      </BibleDialog>
    </BibleContext.Provider>
  );
}

export function useBible() {
  const context = useContext(BibleContext);
  if (context === undefined) {
    throw new Error("useBible must be used within a BibleProvider");
  }
  return context;
}
