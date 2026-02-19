import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
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

  it("extracts scriptures from the fasting family sample text", () => {
    const input = `Introduction
Family is a social unit of two or more persons related by blood, marriage or adoption. God is the originator of the family. The enemies are working tirelessly to make sure our families are not at peace with God and fulfil the purpose of God.

Anchor Scripture
Gen 1:26-28, 2:18-25

Prayer Points
Thank God Almighty for all the benefits your family has received from Him. Psa 103:1-2
Father, please let your spirit of unity reign in our families, in Jesus name. Psa 133:1
Father, let every yoke of disunity and misunderstanding in our families be broken now, in the name of Jesus. Isa 10:27
Father, please don’t ever allow your divine presence to depart from my family, in Jesus name. Exo33:15
Father, I break by the fire of Holy Ghost, every chains of afflictions in my family, in Jesus name. Nah 1:9
Lord Jesus, by the power of your resurrection, I dismantle every satanic altars erected to other gods in past generations from my maternal and paternal side, in Jesus name. Jug 6:25
Father, please don’t let any of my family member experience bitterness in their lives, in Jesus name. Rut 1:20
Father, visit the foundation of my family and destroy every spirit of hardship, in Jesus name. Psa 11:3
Father, please, every battle of life that wants to empty anyone in my family, receive the judgment of death, in Jesus name. Ruth 1:21
Father, by the power in the blood of Jesus, I break any covenants made in my bloodline (lineage) with any other gods, in Jesus name. Isa 28:15
Father, please don’t let my family ever lack the good things of life, in Jesus name. Jam 1:17
Father, please trouble every troublemaker of my family, in Jesus' name. Jos 7:25
Father, I cancel by the blood of Jesus any generational curse affecting my family, in Jesus name. Jer 31:29, Lam 5:7
Father, please bless all our family members with your divine health, in Jesus name. Exo 23:25
Father, I cancel by the blood of Jesus any generational curses affecting my family, in Jesus' name. Jer 31:29 Lam 5:7`;

    expect(extractBibleReferences(input)).toEqual([
      "Gen 1:26-28",
      "Psa 103:1-2",
      "Psa 133:1",
      "Isa 10:27",
      "Exo33:15",
      "Nah 1:9",
      "Jug 6:25",
      "Rut 1:20",
      "Psa 11:3",
      "Ruth 1:21",
      "Isa 28:15",
      "Jam 1:17",
      "Jos 7:25",
      "Jer 31:29",
      "Lam 5:7",
      "Exo 23:25",
    ]);
  });

  it("parses compact book+chapter formatting", () => {
    expect(parseBibleReference("Exo33:15")).toEqual({
      book: "Exodus",
      startChapter: 33,
      endChapter: 33,
      startVerse: 15,
      endVerse: 15,
    });
  });

  it("supports abbreviation styles used in the 2026 prayer guide dataset", () => {
    const guide = readFileSync(
      resolve(process.cwd(), "../../packages/fasting/src/2026-prayer-guide.json"),
      "utf8",
    );
    const refs = extractBibleReferences(guide);

    expect(refs).toContain("Ps.29;4");
    expect(refs).toContain("Mat.6;9-10");
    expect(refs).toContain("Exo33:15");
    expect(refs).toContain("Jug 6:25");
    expect(refs).toContain("Rut 1:20");
    expect(refs).toContain("1Chro 16:8");
    expect(refs).toContain("1Chro 4:10");
    expect(refs).toContain("2Chro 7:14-15");
    expect(refs).toContain("1kings 21:28-29");
    expect(refs).toContain("Isai. 45:2");
    expect(refs).toContain("Act 2:3–4");
  });

  it("handles punctuation and spacing variants for compact references", () => {
    const input =
      "1kings 21:28-29  1Pe 5:5 Rev. 14:8, 17:2 Matt. 5:32 1Cor. 6:18 Rom.8:2 Ps.51:17 Eph.5:3";

    expect(extractBibleReferences(input)).toEqual([
      "1kings 21:28-29",
      "1Pe 5:5",
      "Rev. 14:8, 17:2",
      "Matt. 5:32",
      "1Cor. 6:18",
      "Rom.8:2",
      "Ps.51:17",
      "Eph.5:3",
    ]);
  });

  it("normalizes compact numbered abbreviations", () => {
    expect(parseBibleReference("1Pe 5:5")).toEqual({
      book: "1 Peter",
      startChapter: 5,
      endChapter: 5,
      startVerse: 5,
      endVerse: 5,
    });
    expect(parseBibleReference("1Cor. 6:18")).toEqual({
      book: "1 Corinthians",
      startChapter: 6,
      endChapter: 6,
      startVerse: 18,
      endVerse: 18,
    });
  });
});
