import fs from "node:fs/promises";
import path from "node:path";
import dotenv from "dotenv";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import type { PrayerGuideDocument, PrayerGuideDay, PrayerPoint } from "../src/types";
import {
  findRefusalMessage,
  parseArgValue,
  parseOptionalPositiveInt,
  parsePositiveInt,
  runWithRetries,
} from "./shared";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const RewrittenPointSchema = z.object({
  index: z.number().int().positive(),
  text: z.string(),
});

const RewrittenDaySchema = z.object({
  anchorScripture: z.array(z.string()),
  points: z.array(RewrittenPointSchema),
});

type RewrittenDay = z.infer<typeof RewrittenDaySchema>;

interface CliOptions {
  input: string;
  output: string;
  model: string;
  retries: number;
  day?: number;
}

const DEFAULT_INPUT = "src/2026-prayer-guide.json";
const DEFAULT_OUTPUT = "src/2026-prayer-guide.json";
const DEFAULT_MODEL = "gpt-4o-2024-08-06";
const DEFAULT_RETRIES = 2;

const CANONICAL_BOOKS = [
  "Genesis",
  "Exodus",
  "Leviticus",
  "Numbers",
  "Deuteronomy",
  "Joshua",
  "Judges",
  "Ruth",
  "1 Samuel",
  "2 Samuel",
  "1 Kings",
  "2 Kings",
  "1 Chronicles",
  "2 Chronicles",
  "Ezra",
  "Nehemiah",
  "Esther",
  "Job",
  "Psalms",
  "Proverbs",
  "Ecclesiastes",
  "Song of Solomon",
  "Isaiah",
  "Jeremiah",
  "Lamentations",
  "Ezekiel",
  "Daniel",
  "Hosea",
  "Joel",
  "Amos",
  "Obadiah",
  "Jonah",
  "Micah",
  "Nahum",
  "Habakkuk",
  "Zephaniah",
  "Haggai",
  "Zechariah",
  "Malachi",
  "Matthew",
  "Mark",
  "Luke",
  "John",
  "Acts",
  "Romans",
  "1 Corinthians",
  "2 Corinthians",
  "Galatians",
  "Ephesians",
  "Philippians",
  "Colossians",
  "1 Thessalonians",
  "2 Thessalonians",
  "1 Timothy",
  "2 Timothy",
  "Titus",
  "Philemon",
  "Hebrews",
  "James",
  "1 Peter",
  "2 Peter",
  "1 John",
  "2 John",
  "3 John",
  "Jude",
  "Revelation",
] as const;

function parseArgs(argv: string[]): CliOptions {
  return {
    input: parseArgValue(argv, "--input") ?? DEFAULT_INPUT,
    output: parseArgValue(argv, "--output") ?? DEFAULT_OUTPUT,
    model: parseArgValue(argv, "--model") ?? DEFAULT_MODEL,
    retries: parsePositiveInt(
      parseArgValue(argv, "--retries"),
      DEFAULT_RETRIES,
      "--retries",
    ),
    day: parseOptionalPositiveInt(parseArgValue(argv, "--day"), "--day"),
  };
}

function normalizePointText(text: string): string {
  return text
    .normalize("NFKC")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2013|\u2014/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeScripture(text: string): string {
  return text
    .normalize("NFKC")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2013|\u2014/g, "-")
    .replace(/\s+/g, " ")
    .replace(/\s*:\s*/g, ":")
    .replace(/\s*;\s*/g, "; ")
    .replace(/\s*,\s*/g, ", ")
    .trim();
}

function normalizeRewrittenDay(rewritten: RewrittenDay): RewrittenDay {
  return {
    anchorScripture: rewritten.anchorScripture
      .map(normalizeScripture)
      .map((value) => value.replace(/[.,;]+$/g, "").trim())
      .filter(Boolean),
    points: rewritten.points.map((point) => ({
      index: point.index,
      text: normalizePointText(point.text),
    })),
  };
}

function validateShape(original: PrayerGuideDay, rewritten: RewrittenDay): void {
  if (rewritten.points.length !== original.points.length) {
    throw new Error(
      `Point count changed for day ${original.day}: expected ${original.points.length}, got ${rewritten.points.length}.`,
    );
  }

  for (let i = 0; i < original.points.length; i += 1) {
    const originalPoint = original.points[i];
    const rewrittenPoint = rewritten.points[i];
    if (originalPoint.index !== rewrittenPoint.index) {
      throw new Error(
        `Point index mismatch for day ${original.day} at position ${i + 1}: expected ${originalPoint.index}, got ${rewrittenPoint.index}.`,
      );
    }
  }
}

function buildPrompt(dayEntry: PrayerGuideDay): string {
  const canonicalBooks = CANONICAL_BOOKS.join(", ");

  return [
    "You are rewriting scripture references in user-provided prayer guide text.",
    "Task: normalize Bible references into full canonical book names while preserving all original meaning and wording.",
    "",
    "Strict rules:",
    "1) Do not add or remove points.",
    "2) Keep each point index unchanged.",
    "3) Keep all non-reference wording unchanged, except minimal punctuation/spacing cleanup around references.",
    "4) Expand abbreviated book names to full canonical names only.",
    `5) Canonical books allowed: ${canonicalBooks}.`,
    "6) Keep chapter and verse numbers exactly as given.",
    "7) If chapter/verse separators use semicolons in references, normalize them to colons when they represent chapter:verse (e.g., Ps.29;4 -> Psalms 29:4).",
    "8) For single-chapter books (Obadiah, Philemon, 2 John, 3 John, Jude), normalize `Book N` to `Book 1:N`.",
    "9) Do not invent new references.",
    "10) If text has no reference, keep it unchanged.",
    "",
    "Return only structured JSON for `anchorScripture` and `points`.",
    "",
    "Input day payload:",
    JSON.stringify(
      {
        day: dayEntry.day,
        anchorScripture: dayEntry.anchorScripture ?? [],
        points: dayEntry.points,
      },
      null,
      2,
    ),
  ].join("\n");
}

async function rewriteDayReferences(
  client: OpenAI,
  model: string,
  dayEntry: PrayerGuideDay,
): Promise<RewrittenDay> {
  const response = await client.responses.parse({
    model,
    input: [
      {
        role: "user",
        content: [{ type: "input_text", text: buildPrompt(dayEntry) }],
      },
    ],
    text: {
      format: zodTextFormat(RewrittenDaySchema, "rewritten_scripture_references"),
    },
  });

  const refusal = findRefusalMessage(response);
  if (refusal) {
    throw new Error(`Model refused request: ${refusal}`);
  }

  if (!response.output_parsed) {
    throw new Error("No parsed response returned by model.");
  }

  const normalized = normalizeRewrittenDay(response.output_parsed);
  validateShape(dayEntry, normalized);
  return normalized;
}

function hasDayChanged(original: PrayerGuideDay, rewritten: RewrittenDay): boolean {
  const originalAnchor = (original.anchorScripture ?? []).map(normalizeScripture);
  if (originalAnchor.length !== rewritten.anchorScripture.length) return true;
  if (originalAnchor.some((value, idx) => value !== rewritten.anchorScripture[idx])) {
    return true;
  }

  const originalPoints = original.points.map((point) => ({
    index: point.index,
    text: normalizePointText(point.text),
  }));

  if (originalPoints.length !== rewritten.points.length) return true;

  return originalPoints.some((point, idx) => {
    const rewrittenPoint = rewritten.points[idx];
    return point.index !== rewrittenPoint.index || point.text !== rewrittenPoint.text;
  });
}

function toPrayerPoints(points: RewrittenDay["points"]): PrayerPoint[] {
  return points.map((point) => ({
    index: point.index,
    text: point.text,
  }));
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY is missing. Add it to packages/fasting/.env or your shell environment.",
    );
  }

  const cwd = process.cwd();
  const inputPath = path.resolve(cwd, options.input);
  const outputPath = path.resolve(cwd, options.output);

  const raw = await fs.readFile(inputPath, "utf8");
  const document = JSON.parse(raw) as PrayerGuideDocument;

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  let processed = 0;
  let changed = 0;
  let unchanged = 0;
  const failedDays: number[] = [];
  const changedDays: number[] = [];

  for (const dayEntry of document.days) {
    if (options.day && dayEntry.day !== options.day) {
      continue;
    }

    processed += 1;
    console.log(`Rewriting references for day ${dayEntry.day}...`);

    try {
      const rewritten = await runWithRetries({
        retries: options.retries,
        label: `day-${dayEntry.day}`,
        task: () => rewriteDayReferences(client, options.model, dayEntry),
      });

      if (!hasDayChanged(dayEntry, rewritten)) {
        unchanged += 1;
        continue;
      }

      dayEntry.anchorScripture = rewritten.anchorScripture;
      dayEntry.points = toPrayerPoints(rewritten.points);
      changed += 1;
      changedDays.push(dayEntry.day);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Failed day ${dayEntry.day}: ${message}`);
      failedDays.push(dayEntry.day);
    }
  }

  await fs.writeFile(outputPath, `${JSON.stringify(document, null, 4)}\n`, "utf8");

  console.log(
    [
      `Processed ${processed} days.`,
      `Changed ${changed} days.`,
      `Unchanged ${unchanged} days.`,
      failedDays.length > 0 ? `Failed ${failedDays.length} days.` : "Failed 0 days.",
    ].join(" "),
  );

  if (changedDays.length > 0) {
    console.log(`Updated days: ${changedDays.join(", ")}`);
  }
  if (failedDays.length > 0) {
    console.warn(`Failed days: ${failedDays.join(", ")}`);
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Failed to rewrite scripture references: ${message}`);
  process.exitCode = 1;
});
