import fs from "node:fs/promises";
import path from "node:path";
import OpenAI from "openai";
import dotenv from "dotenv";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import type { PrayerGuideDocument } from "../src/types";
import {
  buildImageMap,
  findRefusalMessage,
  parseArgValue,
  parseBooleanFlag,
  parsePositiveInt,
  runWithRetries,
  toDataUrl,
} from "./shared";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const HeaderSchema = z.object({
  prayerFocus: z.string(),
  introduction: z.string(),
  anchorScripture: z.array(z.string()),
});

type HeaderData = z.infer<typeof HeaderSchema>;

interface CliOptions {
  imagesDir: string;
  input: string;
  output: string;
  model: string;
  startPage: number;
  endPage: number;
  retries: number;
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
    force: parseBooleanFlag(argv, "--force"),
  };
}

function normalizeSpace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeScripture(value: string): string {
  return normalizeSpace(value)
    .replace(/\s*;\s*/g, ";")
    .replace(/\s*:\s*/g, ":")
    .replace(/\s*,\s*/g, ", ");
}

function normalizeHeader(data: HeaderData): HeaderData {
  const prayerFocus = normalizeSpace(data.prayerFocus);
  const introduction = normalizeSpace(data.introduction);
  const anchorScripture = data.anchorScripture
    .map(normalizeScripture)
    .map((value) => value.replace(/[.;,]+$/g, "").trim())
    .filter(Boolean);

  return {
    prayerFocus,
    introduction,
    anchorScripture: Array.from(new Set(anchorScripture)),
  };
}

async function extractHeaderFromImage(
  client: OpenAI,
  model: string,
  imagePath: string,
): Promise<HeaderData> {
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
              "Extract only the top banner details from this fasting guide page image.",
              "This is a transcription/OCR request for user-provided content.",
              "Return structured JSON with:",
              "1) prayerFocus: the large heading under 'PRAYER FOCUS'.",
              "2) introduction: the introduction paragraph text in the banner.",
              "3) anchorScripture: list of scripture references shown in the banner.",
              "Rules:",
              "- Ignore everything under PRAYER POINTS or ACTION POINTS.",
              "- If a field is not present or unreadable, return empty string for text fields and [] for anchorScripture.",
              "- Do not invent values.",
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
      format: zodTextFormat(HeaderSchema, "prayer_guide_header"),
    },
  });

  const refusal = findRefusalMessage(response);
  if (refusal) {
    throw new Error(`Model refused request: ${refusal}`);
  }

  if (!response.output_parsed) {
    throw new Error("No parsed response returned by model.");
  }

  return normalizeHeader(response.output_parsed);
}

async function extractHeaderWithRetries(
  client: OpenAI,
  model: string,
  imagePath: string,
  retries: number,
): Promise<HeaderData> {
  return runWithRetries({
    retries,
    label: path.basename(imagePath),
    task: () => extractHeaderFromImage(client, model, imagePath),
  });
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

  const imageMap = await buildImageMap(imagesDir);
  const raw = await fs.readFile(inputPath, "utf8");
  const document = JSON.parse(raw) as PrayerGuideDocument;

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  let updatedCount = 0;
  let failedCount = 0;
  const failedPages: number[] = [];

  for (const dayEntry of document.days) {
    if (dayEntry.page < options.startPage || dayEntry.page > options.endPage) {
      continue;
    }

    if (
      !options.force &&
      dayEntry.prayerFocus &&
      dayEntry.introduction &&
      Array.isArray(dayEntry.anchorScripture) &&
      dayEntry.anchorScripture.length > 0
    ) {
      continue;
    }

    const imagePath = imageMap.get(dayEntry.page);
    if (!imagePath) {
      throw new Error(`Missing image for page ${dayEntry.page} in ${imagesDir}`);
    }

    console.log(`Extracting headers for day ${dayEntry.day} (page ${dayEntry.page})...`);
    try {
      const header = await extractHeaderWithRetries(
        client,
        options.model,
        imagePath,
        options.retries,
      );

      dayEntry.prayerFocus = header.prayerFocus;
      dayEntry.introduction = header.introduction;
      dayEntry.anchorScripture = header.anchorScripture;
      updatedCount += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(
        `Skipping day ${dayEntry.day} (page ${dayEntry.page}): ${message}`,
      );
      dayEntry.prayerFocus = dayEntry.prayerFocus ?? "";
      dayEntry.introduction = dayEntry.introduction ?? "";
      dayEntry.anchorScripture = dayEntry.anchorScripture ?? [];
      failedCount += 1;
      failedPages.push(dayEntry.page);
    }
  }

  await fs.writeFile(outputPath, `${JSON.stringify(document, null, 2)}\n`, "utf8");

  console.log(`Updated ${updatedCount} day entries. Output written to ${outputPath}`);
  if (failedCount > 0) {
    console.warn(
      `Skipped ${failedCount} pages due extraction errors. Pages: ${failedPages.join(", ")}`,
    );
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Failed to extract prayer guide headers: ${message}`);
  process.exitCode = 1;
});
