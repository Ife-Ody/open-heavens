import { describe, expect, it } from "vitest";
import { BibleTagger } from "./bible-tagger";

describe("BibleTagger", () => {
  const tagger = new BibleTagger();

  it("finds references in plain text", () => {
    const refs = tagger.findReferences("Study John 3:16 and Romans 8:28 today.");
    expect(refs).toEqual(["John 3:16", "Romans 8:28"]);
  });

  it("splits text into text/reference segments", () => {
    const segments = tagger.parseTextToSegments(
      "Meditate on John 3:16 and Psalm 23:1-2.",
    );

    expect(segments).toEqual([
      { type: "text", content: "Meditate on " },
      { type: "reference", content: "John 3:16" },
      { type: "text", content: " and " },
      { type: "reference", content: "Psalm 23:1-2" },
      { type: "text", content: "." },
    ]);
  });
});
