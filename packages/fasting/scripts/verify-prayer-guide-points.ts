import fs from "node:fs/promises";
import path from "node:path";
import dotenv from "dotenv";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import type { PrayerGuideDocument, PrayerGuideSection } from "../src/types";
import {
  buildImageMap,
  findRefusalMessage,
  parseArgValue,
  parseBooleanFlag,
  parseOptionalPositiveInt,
  parsePositiveInt,
  runWithRetries,
  toDataUrl,
} from "./shared";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const ExtractedPointSchema = z.object({
  index: z.number().int().positive(),
  text: z.string(),
});

const ExtractedDaySchema = z.object({
  section: z.enum(["PRAYER_POINTS", "ACTION_POINTS", "UNKNOWN"]),
  points: z.array(ExtractedPointSchema),
});

type ExtractedDay = z.infer<typeof ExtractedDaySchema>;

interface CliOptions {
  imagesDir: string;
  input: string;
  output: string;
  model: string;
  startPage: number;
  endPage: number;
  retries: number;
  day?: number;
  force: boolean;
}

const DEFAULT_IMAGES_DIR =
  "src/2026 Prayer Guide - 30 days Fasting and Prayer images";
const DEFAULT_INPUT = "src/2026-prayer-guide.json";
const DEFAULT_OUTPUT = "src/2026-prayer-guide.json";
const DEFAULT_MODEL = "gpt-4o-2024-08-06";
const DEFAULT_START_PAGE = 3;
const DEFAULT_END_PAGE = 32;
const DEFAULT_RETRIES = 2;

function parseArgs(argv: string[]): CliOptions {
  const startPage = parsePositiveInt(
    parseArgValue(argv, "--start-page"),
    DEFAULT_START_PAGE,
    "--start-page",
  );
  const endPage = parsePositiveInt(
    parseArgValue(argv, "--end-page"),
    DEFAULT_END_PAGE,
    "--end-page",
  );
  const retries = parsePositiveInt(
    parseArgValue(argv, "--retries"),
    DEFAULT_RETRIES,
    "--retries",
  );

  if (endPage < startPage) {
    throw new Error("--end-page must be greater than or equal to --start-page.");
  }

  return {
    imagesDir: parseArgValue(argv, "--images-dir") ?? DEFAULT_IMAGES_DIR,
    input: parseArgValue(argv, "--input") ?? DEFAULT_INPUT,
    output: parseArgValue(argv, "--output") ?? DEFAULT_OUTPUT,
    model: parseArgValue(argv, "--model") ?? DEFAULT_MODEL,
    startPage,
    endPage,
    retries,
    day: parseOptionalPositiveInt(parseArgValue(argv, "--day"), "--day"),
    force: parseBooleanFlag(argv, "--force"),
  };
}

function normalizePointText(text: string): string {
  return text
    .normalize("NFKC")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2013|\u2014/g, "-")
    .replace(/\s+/g, " ")
    .replace(/\s*([,.;:!?])\s*/g, "$1")
    .replace(/\s*-\s*/g, "-")
    .trim();
}

function normalizePoints(points: { index: number; text: string }[]) {
  return points.map((point) => ({
    index: point.index,
    text: normalizePointText(point.text),
  }));
}

function pointsSignature(points: { index: number; text: string }[]): string[] {
  return normalizePoints(points).map((point) => `${point.index}|${point.text}`);
}

function arePointsEqual(
  a: { index: number; text: string }[],
  b: { index: number; text: string }[],
): boolean {
  const left = pointsSignature(a);
  const right = pointsSignature(b);

  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
}

function normalizeExtractedDay(day: ExtractedDay): ExtractedDay {
  const points = day.points
    .map((point) => ({
      index: point.index,
      text: normalizePointText(point.text),
    }))
    .filter((point) => point.text.length > 0);

  const deduped: ExtractedDay["points"] = [];
  const seen = new Set<string>();
  for (const point of points) {
    const key = `${point.index}|${point.text}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(point);
  }

  deduped.sort((a, b) => a.index - b.index);

  return {
    section: day.section,
    points: deduped,
  };
}

async function extractPointsFromImage(
  client: OpenAI,
  model: string,
  imagePath: string,
): Promise<ExtractedDay> {
  const imageDataUrl = await toDataUrl(imagePath);

  const response = await client.responses.parse({
    model,
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: [
              "This is an OCR transcription task for a user-provided prayer guide image.",
              "Extract only the numbered points section in the body area.",
              "Ignore top banner content like prayer focus/introduction/anchor scripture.",
              "Rules:",
              "- If heading says PRAYER POINTS use section PRAYER_POINTS.",
              "- If heading says ACTION POINTS use section ACTION_POINTS.",
              "- Return each numbered item with its visible index and full text.",
              "- Keep order exactly as shown.",
              "- Do not merge two different numbered items into one.",
              "- If nothing is readable, use section UNKNOWN and points [].",
            ].join("\n"),
          },
          {
            type: "input_image",
            image_url: imageDataUrl,
            detail: "high",
          },
        ],
      },
    ],
    text: {
      format: zodTextFormat(ExtractedDaySchema, "prayer_guide_points"),
    },
  });

  const refusal = findRefusalMessage(response);
  if (refusal) {
    throw new Error(`Model refused request: ${refusal}`);
  }

  if (!response.output_parsed) {
    throw new Error("No parsed response returned by model.");
  }

  return normalizeExtractedDay(response.output_parsed);
}

async function extractPointsWithRetries(
  client: OpenAI,
  model: string,
  imagePath: string,
  retries: number,
): Promise<ExtractedDay> {
  return runWithRetries({
    retries,
    label: path.basename(imagePath),
    task: () => extractPointsFromImage(client, model, imagePath),
  });
}

function shouldSkipByIndexPattern(
  section: PrayerGuideSection,
  points: { index: number; text: string }[],
): boolean {
  if (section === "ACTION_POINTS") return false;
  if (points.length <= 1) return false;

  const indices = points.map((point) => point.index);
  const hasDuplicateIndex = new Set(indices).size !== indices.length;
  if (hasDuplicateIndex) return false;

  for (let i = 1; i < indices.length; i += 1) {
    if (indices[i] !== indices[i - 1] + 1) {
      return false;
    }
  }

  return true;
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
  const imagesDir = path.resolve(cwd, options.imagesDir);

  const raw = await fs.readFile(inputPath, "utf8");
  const document = JSON.parse(raw) as PrayerGuideDocument;
  const imageMap = await buildImageMap(imagesDir);

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  let compared = 0;
  let corrected = 0;
  let unchanged = 0;
  let skipped = 0;
  const correctedDays: number[] = [];
  const failedDays: number[] = [];

  for (const dayEntry of document.days) {
    if (options.day && dayEntry.day !== options.day) {
      continue;
    }

    if (dayEntry.page < options.startPage || dayEntry.page > options.endPage) {
      continue;
    }

    if (
      !options.force &&
      shouldSkipByIndexPattern(dayEntry.section, dayEntry.points)
    ) {
      skipped += 1;
      continue;
    }

    const imagePath = imageMap.get(dayEntry.page);
    if (!imagePath) {
      throw new Error(`Missing image for page ${dayEntry.page} in ${imagesDir}`);
    }

    compared += 1;
    console.log(`Verifying day ${dayEntry.day} (page ${dayEntry.page})...`);

    try {
      const extracted = await extractPointsWithRetries(
        client,
        options.model,
        imagePath,
        options.retries,
      );

      const sameSection = extracted.section === dayEntry.section;
      const samePoints = arePointsEqual(dayEntry.points, extracted.points);

      if (sameSection && samePoints) {
        unchanged += 1;
        continue;
      }

      dayEntry.section = extracted.section;
      dayEntry.points = extracted.points;
      corrected += 1;
      correctedDays.push(dayEntry.day);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Failed day ${dayEntry.day}: ${message}`);
      failedDays.push(dayEntry.day);
    }
  }

  await fs.writeFile(outputPath, `${JSON.stringify(document, null, 2)}\n`, "utf8");

  console.log(
    [
      `Compared ${compared} days.`,
      `Corrected ${corrected} days.`,
      `Unchanged ${unchanged} days.`,
      `Skipped ${skipped} days.`,
      failedDays.length ? `Failed days: ${failedDays.join(", ")}.` : "",
      correctedDays.length ? `Corrected days: ${correctedDays.join(", ")}.` : "",
      `Output: ${outputPath}`,
    ]
      .filter(Boolean)
      .join(" "),
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Failed to verify prayer guide points: ${message}`);
  process.exitCode = 1;
});
