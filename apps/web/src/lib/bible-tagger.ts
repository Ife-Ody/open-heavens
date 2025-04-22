import parse, { DOMNode, Element, Text } from "html-react-parser";
import React, { ReactElement } from "react";
import { getBibleReferenceRegex, extractBibleReferences } from "./bible-utils";

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

  public tagText(text: string): string {
    const regex = getBibleReferenceRegex();

    return text.replace(regex, (match) => {
      const reference = encodeURIComponent(match);
      return `<Link href="/bible/${reference}" className="bible-reference text-primary">${match}</Link>`;
    });
  }

  public getReferenceRegex(): RegExp {
    return getBibleReferenceRegex(true); // true for capturing groups
  }

  public findReferences(text: string): string[] {
    return extractBibleReferences(text);
  }

  public parseTextToSegments(text: string): TextSegment[] {
    const regex = this.getReferenceRegex();
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
