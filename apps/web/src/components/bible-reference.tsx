"use client";

import { useMemo } from "react";
import { useBibleDialog } from "src/app/context/bible-context";
import {
  ParsedReference,
  parseBibleReference,
  extractSelectedVerses,
} from "src/lib/bible-utils";

interface BibleReferenceProps {
  reference: string;
}

export function BibleReference({ reference }: BibleReferenceProps) {
  const { openDialog, setBook, setChapter, setSelectedVerses } =
    useBibleDialog();

  const parsedReference = useMemo<ParsedReference | null>(() => {
    return parseBibleReference(reference);
  }, [reference]);

  if (!parsedReference) {
    return <span className="text-muted-foreground">{reference}</span>;
  }

  const handleClick = () => {
    setBook(parsedReference.book);
    setChapter(parsedReference.startChapter);

    // Generate array of verses if verse range is specified
    if (
      parsedReference.startVerse !== undefined &&
      parsedReference.endVerse !== undefined
    ) {
      const verses = extractSelectedVerses(reference, parsedReference);
      setSelectedVerses(verses);
    } else {
      setSelectedVerses([]);
    }

    openDialog();
  };

  return (
    <button className="text-primary" onClick={handleClick}>
      {reference}
    </button>
  );
}
