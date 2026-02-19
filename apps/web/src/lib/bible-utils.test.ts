import { describe, expect, it } from "vitest";
import {
  extractBibleReferences,
  extractSelectedVerses,
  normalizeBookName,
  parseBibleReference,
} from "./bible-utils";

describe("bible-utils parser", () => {
  it("parses a simple chapter and verse reference", () => {
    expect(parseBibleReference("John 3:16")).toEqual({
      book: "John",
      startChapter: 3,
      endChapter: 3,
      startVerse: 16,
      endVerse: 16,
    });
  });

  it("parses comma-separated verses and ranges", () => {
    expect(parseBibleReference("John 3:16, 18-19")).toEqual({
      book: "John",
      startChapter: 3,
      endChapter: 3,
      startVerse: 16,
      endVerse: 19,
      selectedVerses: [16, 18, 19],
    });
  });

  it("parses cross-chapter ranges", () => {
    expect(parseBibleReference("Genesis 1:31-2:3")).toEqual({
      book: "Genesis",
      startChapter: 1,
      endChapter: 2,
      startVerse: 31,
      endVerse: 3,
    });
  });

  it("normalizes numbered and abbreviated book names", () => {
    expect(normalizeBookName("1 sam")).toBe("1 Samuel");
    expect(normalizeBookName("john")).toBe("John");
  });

  it("extracts unique references from free text", () => {
    const input =
      "Read John 3:16 and Psalm 23:1-2. Revisit John 3:16 after prayers.";
    expect(extractBibleReferences(input)).toEqual(["John 3:16", "Psalm 23:1-2"]);
  });

  it("extracts selected verses for comma-separated references", () => {
    expect(extractSelectedVerses("John 3:16, 18-19")).toEqual([16, 18, 19]);
  });

  it("expands contiguous verse ranges", () => {
    expect(extractSelectedVerses("Psalm 23:1-3")).toEqual([1, 2, 3]);
  });
});
