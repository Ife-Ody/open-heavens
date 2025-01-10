import parse, { DOMNode, Element, Text } from "html-react-parser";
import React, { ReactElement } from "react";

interface BibleTaggerConfig {
  element?: string;
  maxNodes?: number;
  newWindow?: boolean;
  version?: string;
  showArticlesLink?: boolean;
  fontSize?: string;
  translation?: string;
  customCSS?: boolean;
  parseAnchors?: boolean;
}

interface TextSegment {
  type: "text" | "reference";
  content: string;
}

export class BibleTagger {
  private translation: string = "kjv";
  private skipRe: string = "^(script|style|textarea|h1|h2|cite|a)$";

  constructor(config?: BibleTaggerConfig) {
    if (config) {
      Object.assign(this, config);
    }
  }

  private getBooks(): string {
    if (this.translation === "kjv") {
      return (
        "Genesis|Gen|Ge|Gn|Exodus|Ex|Exod?|Leviticus|Lev?|Lv|Levit?|Numbers|" +
        "Nu|Nm|Hb|Nmb|Numb?|Deuteronomy|Deut?|De|Dt|Joshua|Josh?|Jsh|Judges|Jdgs?|Judg?|Jd|Ruth|Ru|Rth|" +
        "Samuel|Sam?|Sml|Kings|Kngs?|Kgs|Kin?|Chronicles|Chr?|Chron|Ezra|Ez|" +
        "Nehemiah|Nehem?|Ne|Esther|Esth?|Es|Job|Jb|Psalms?|Psa?|Pss|Psm|Proverbs?|Prov?|Prv|Pr|" +
        "Ecclesiastes|Eccl?|Eccles|Ecc?|Songs?ofSolomon|Song?|So|Songs|Isaiah|Isa|Is|Jeremiah|" +
        "Jer?|Jr|Jerem|Lamentations|Lam|Lament?|Ezekiel|Ezek?|Ezk|Daniel|Dan?|Dn|Hosea|" +
        "Hos?|Joel|Jo|Amos|Am|Obadiah|Obad?|Ob|Jonah|Jon|Jnh|Micah|Mi?c|Nahum|Nah?|" +
        "Habakkuk|Ha?b|Habak|Zephaniah|Ze?ph?|Haggai|Ha?g|Hagg|Zechariah|Zech?|Ze?c|" +
        "Malachi|Malac?|Ma?l|Mat{1,2}hew|Mat?|Matt?|Mt|Mark?|Mrk?|Mk|Luke|Lu?k|Lk|John?|Jhn|Jo|Jn|" +
        "Acts?|Ac|Romans|Rom?|Rm|Corinthians|Cor?|Corin|Galatians|Gal?|Galat|" +
        "Ephesians|Eph|Ephes|Philippians|Phili?|Php|Pp|Colossians|Col?|Colos|" +
        "Thessalonians|Thess?|Th|Timothy|Tim?|Titus|Tts|Tit?|Philemon|Phm?|Philem|Pm|" +
        "Hebrews|Hebr?|James|Jam|Jms?|Jas|Peter|Pete?|Pe|Pt|Jude?|Jd|Ju|Revelations?|Rev?|Revel"
      );
    }
    return "";
  }

  public tagText(text: string): string {
    const vols = "I+|1st|2nd|3rd|First|Second|Third|1|2|3";
    const books = this.getBooks();
    const verse = "\\d+(?::\\d+)?(?:\\s?[-–—&,]\\s?\\d+(?::\\d+)?)*";
    const passage = `((\\d+:\\d+[-–—]\\d+:\\d+)|(\\d+:\\d+[-–—]\\d+)|(\\d+[-–—]\\d+(?::\\d+)?)|(\\d+:\\d+)|(\\d+))`;
    const book = `((?:(${vols})\\s?)?(${books})\\.?\\s?)`;
    const regex = new RegExp(`\\b${book}${passage}`, "gm");

    return text.replace(regex, (match) => {
      const reference = encodeURIComponent(match);
      return `<Link href="/bible/${reference}" className="bible-reference text-primary">${match}</Link>`;
    });
  }

  public getReferenceRegex(): RegExp {
    const vols = "I+|1st|2nd|3rd|First|Second|Third|1|2|3";
    const books = this.getBooks();
    const verse = "\\d+(?::\\d+)?(?:\\s?[-–—&,]\\s?\\d+(?::\\d+)?)*";
    const passage = `((\\d+:\\d+[-–—]\\d+:\\d+)|(\\d+:\\d+[-–—]\\d+)|(\\d+[-–—]\\d+(?::\\d+)?)|(\\d+:\\d+)|(\\d+))`;
    const book = `((?:(${vols})\\s?)?(${books})\\.?\\s?)`;
    return new RegExp(`\\b${book}${passage}`, "gm");
  }

  public findReferences(text: string): string[] {
    const regex = this.getReferenceRegex();
    const matches = text.match(regex);
    return matches ? [...new Set(matches)] : [];
  }

  public parseTextToSegments(text: string): TextSegment[] {
    const vols = "I+|1st|2nd|3rd|First|Second|Third|1|2|3";
    const books = this.getBooks();
    const verse = "\\d+(:\\d+)?(?:\\s?[-–—&,]\\s?\\d+)*";
    const passage = `((\\d+(\\.:|:)\\d+[-–—]\\d+(\\.:|:)\\d+)|(\\d+(\\.:|:)\\d+[-–—]\\d+)|(\\d+[-–—]\\d+)|(\\d+(\\.:|:)\\d+)|(\\d+))`;
    const book = `((?:(${vols})\\s?)?(${books})\\.?\\s?)`;
    const regex = new RegExp(`\\b${book}${passage}`, "gm");

    const segments: TextSegment[] = [];
    let lastIndex = 0;

    let match;
    while ((match = regex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        segments.push({
          type: "text",
          content: text.slice(lastIndex, match.index),
        });
      }

      // Add the reference
      segments.push({
        type: "reference",
        content: match[0],
      });

      lastIndex = regex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      segments.push({
        type: "text",
        content: text.slice(lastIndex),
      });
    }

    return segments;
  }

  private shouldProcessNode(node: DOMNode): boolean {
    if (node.type === "tag") {
      const element = node as Element;
      // Skip processing certain tags
      return !new RegExp(this.skipRe).test(element.name);
    }
    return true;
  }

  public parseHTML(
    html: string,
    BibleReferenceComponent: React.ComponentType<{ reference: string }>,
  ) {
    const regex = this.getReferenceRegex();

    return parse(html, {
      replace: (node) => {
        if (node.type === "text" && this.shouldProcessNode(node)) {
          const text = (node as Text).data;
          const segments: (string | ReactElement)[] = [];
          let lastIndex = 0;

          let match;
          while ((match = regex.exec(text)) !== null) {
            if (match.index > lastIndex) {
              segments.push(text.slice(lastIndex, match.index));
            }

            segments.push(
              React.createElement(BibleReferenceComponent, {
                key: `${match[0]}-${match.index}`,
                reference: match[0],
              }),
            );

            lastIndex = regex.lastIndex;
          }

          if (lastIndex < text.length) {
            segments.push(text.slice(lastIndex));
          }

          if (segments.length > 0) {
            return React.createElement(React.Fragment, null, ...segments);
          }
        }

        return node;
      },
    });
  }
}

export default BibleTagger;
