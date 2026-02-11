import fs from "node:fs/promises";
import path from "node:path";

export const SUPPORTED_IMAGE_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
]);

export function parseBooleanFlag(argv: string[], flag: string): boolean {
  return argv.includes(flag);
}

export function parseArgValue(
  argv: string[],
  flag: string,
): string | undefined {
  const index = argv.indexOf(flag);
  if (index === -1) return undefined;

  const value = argv[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${flag}.`);
  }

  return value;
}

export function parsePositiveInt(
  value: string | undefined,
  fallback: number,
  flag: string,
): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${flag} must be a positive integer.`);
  }
  return parsed;
}

export function parseOptionalPositiveInt(
  value: string | undefined,
  flag: string,
): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${flag} must be a positive integer.`);
  }
  return parsed;
}

export function getMimeType(imagePath: string): string {
  const ext = path.extname(imagePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  throw new Error(`Unsupported image extension: ${ext}`);
}

export async function toDataUrl(imagePath: string): Promise<string> {
  const bytes = await fs.readFile(imagePath);
  const base64 = bytes.toString("base64");
  return `data:${getMimeType(imagePath)};base64,${base64}`;
}

export function getPageFromImageName(filename: string): number | null {
  const match = filename.match(/-(\d{2})\.(png|jpg|jpeg|webp)$/i);
  if (!match) return null;
  return Number.parseInt(match[1], 10);
}

export async function buildImageMap(imagesDir: string): Promise<Map<number, string>> {
  const entries = await fs.readdir(imagesDir, { withFileTypes: true });
  const imageMap = new Map<number, string>();

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!SUPPORTED_IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      continue;
    }

    const page = getPageFromImageName(entry.name);
    if (!page) continue;
    imageMap.set(page, path.join(imagesDir, entry.name));
  }

  return imageMap;
}

export function findRefusalMessage(response: {
  output: Array<{
    type: string;
    content?: Array<{ type: string; refusal?: string }>;
  }>;
}): string | null {
  for (const output of response.output) {
    if (output.type !== "message" || !Array.isArray(output.content)) continue;

    for (const content of output.content) {
      if (content.type === "refusal" && content.refusal) {
        return content.refusal;
      }
    }
  }

  return null;
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runWithRetries<T>(options: {
  retries: number;
  label: string;
  task: () => Promise<T>;
}): Promise<T> {
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= options.retries + 1; attempt += 1) {
    try {
      return await options.task();
    } catch (error) {
      lastError = error;
      if (attempt > options.retries) break;

      const message = error instanceof Error ? error.message : String(error);
      console.warn(
        `Attempt ${attempt} failed for ${options.label}: ${message}. Retrying...`,
      );
      await sleep(attempt * 1500);
    }
  }

  throw lastError;
}

