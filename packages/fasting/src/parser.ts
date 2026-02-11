import fs from "node:fs/promises";
import path from "node:path";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
import type {
  ExtractPrayerGuideOptions,
  PrayerGuideDay,
  PrayerGuideDocument,
  PrayerGuideSection,
  PrayerPoint,
} from "./types";

interface PdfTextItem {
  str: string;
  hasEOL?: boolean;
}

const DEFAULT_START_PAGE = 3;
const DEFAULT_TOTAL_DAYS = 30;
const DEFAULT_START_DATE = "2026-02-01";

const PAGE_FOOTER_PATTERN = /^\d+\s+\|\s+P\s*a\s*g\s*e$/i;
const SECTION_PATTERN = /(P\s*RAYER\s*POINTS?|A\s*C\s*T\s*I\s*O\s*N\s*POINTS?)[:.]?/i;
const POINT_PATTERN = /^(\d{1,2})\.\s*(.*)$/;

function normalizeLine(line: string): string {
  return line
    .replace(/\u00a0/g, " ")
    .replace(/\s*\|\s*/g, " | ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizePointText(text: string): string {
  return text
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/([(\[])\s+/g, "$1")
    .replace(/\s+([)\]])/g, "$1")
    .trim();
}

function isNoiseLine(line: string): boolean {
  if (!line) return true;
  if (PAGE_FOOTER_PATTERN.test(line)) return true;

  return (
    /powered by/i.test(line) ||
    /RCCG/i.test(line) ||
    /directorate/i.test(line)
  );
}

function resolveSection(matchText: string): PrayerGuideSection {
  const normalized = matchText.replace(/\s+/g, "").toUpperCase();
  if (normalized.startsWith("ACTION")) {
    return "ACTION_POINTS";
  }
  if (normalized.startsWith("PRAYER")) {
    return "PRAYER_POINTS";
  }
  return "UNKNOWN";
}

function parsePointsFromLines(lines: string[]): {
  section: PrayerGuideSection;
  points: PrayerPoint[];
} {
  let section: PrayerGuideSection = "UNKNOWN";
  let hasReachedSection = false;
  let currentPoint: PrayerPoint | null = null;
  const points: PrayerPoint[] = [];

  const pushCurrentPoint = () => {
    if (!currentPoint) return;

    currentPoint.text = normalizePointText(currentPoint.text);
    if (currentPoint.text) {
      points.push(currentPoint);
    }
    currentPoint = null;
  };

  const consumePointLine = (line: string) => {
    const pointMatch = line.match(POINT_PATTERN);
    if (pointMatch) {
      pushCurrentPoint();
      currentPoint = {
        index: Number(pointMatch[1]),
        text: normalizePointText(pointMatch[2]),
      };
      return;
    }

    if (!currentPoint) return;
    currentPoint.text = normalizePointText(`${currentPoint.text} ${line}`);
  };

  for (const rawLine of lines) {
    const line = normalizeLine(rawLine);
    if (isNoiseLine(line)) continue;

    if (!hasReachedSection) {
      const sectionMatch = line.match(SECTION_PATTERN);
      if (!sectionMatch) continue;

      section = resolveSection(sectionMatch[1]);
      hasReachedSection = true;

      const markerEnd = sectionMatch.index! + sectionMatch[0].length;
      const remainder = line.slice(markerEnd).trim();
      if (remainder) {
        consumePointLine(remainder);
      }
      continue;
    }

    consumePointLine(line);
  }

  pushCurrentPoint();

  return { section, points };
}

async function getPageLines(
  document: PDFDocumentProxy,
  pageNumber: number,
): Promise<string[]> {
  const page = await document.getPage(pageNumber);
  const content = await page.getTextContent();

  const lines: string[] = [];
  let buffer = "";

  for (const item of content.items as PdfTextItem[]) {
    buffer += item.str;

    if (item.hasEOL) {
      const normalized = normalizeLine(buffer);
      if (normalized) lines.push(normalized);
      buffer = "";
    }
  }

  if (buffer.trim()) {
    lines.push(normalizeLine(buffer));
  }

  return lines;
}

function toIsoDate(startDate: string, dayOffset: number): string {
  const date = new Date(`${startDate}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + dayOffset);
  return date.toISOString().slice(0, 10);
}

export async function extractPrayerGuideFromPdf(
  pdfPath: string,
  options: ExtractPrayerGuideOptions = {},
): Promise<PrayerGuideDocument> {
  const startPage = options.startPage ?? DEFAULT_START_PAGE;
  const totalDays = options.totalDays ?? DEFAULT_TOTAL_DAYS;
  const startDate = options.startDate ?? DEFAULT_START_DATE;

  const resolvedPdfPath = path.resolve(pdfPath);
  const data = await fs.readFile(resolvedPdfPath);
  const document = await pdfjsLib.getDocument({
    data: new Uint8Array(data),
  }).promise;

  const maxTargetPage = startPage + totalDays - 1;
  if (maxTargetPage > document.numPages) {
    throw new Error(
      `Requested pages ${startPage}-${maxTargetPage}, but PDF has only ${document.numPages} pages.`,
    );
  }

  const days: PrayerGuideDay[] = [];

  for (let offset = 0; offset < totalDays; offset += 1) {
    const pageNumber = startPage + offset;
    const dayNumber = offset + 1;
    const lines = await getPageLines(document, pageNumber);
    const { section, points } = parsePointsFromLines(lines);

    days.push({
      day: dayNumber,
      page: pageNumber,
      date: toIsoDate(startDate, offset),
      section,
      points,
    });
  }

  return {
    sourceFile: resolvedPdfPath,
    totalPages: document.numPages,
    startPage,
    totalDays,
    startDate,
    days,
  };
}
