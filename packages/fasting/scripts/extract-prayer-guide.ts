import fs from "node:fs/promises";
import path from "node:path";
import { extractPrayerGuideFromPdf } from "../src/parser";

interface CliOptions {
  input: string;
  output: string;
  startPage: number;
  totalDays: number;
  startDate: string;
}

const DEFAULT_INPUT = "src/2026 Prayer Guide - 30 days Fasting and Prayer.pdf";
const DEFAULT_OUTPUT = "src/2026-prayer-guide.json";
const DEFAULT_START_PAGE = 3;
const DEFAULT_TOTAL_DAYS = 30;
const DEFAULT_START_DATE = "2026-02-01";

function parseArgNumber(value: string, flagName: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${flagName} must be a positive integer.`);
  }
  return parsed;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    input: DEFAULT_INPUT,
    output: DEFAULT_OUTPUT,
    startPage: DEFAULT_START_PAGE,
    totalDays: DEFAULT_TOTAL_DAYS,
    startDate: DEFAULT_START_DATE,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (!arg.startsWith("--")) {
      continue;
    }

    const value = argv[i + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for ${arg}.`);
    }

    switch (arg) {
      case "--input":
        options.input = value;
        break;
      case "--output":
        options.output = value;
        break;
      case "--start-page":
        options.startPage = parseArgNumber(value, "--start-page");
        break;
      case "--days":
        options.totalDays = parseArgNumber(value, "--days");
        break;
      case "--start-date":
        options.startDate = value;
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }

    i += 1;
  }

  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const cwd = process.cwd();
  const inputPath = path.resolve(cwd, options.input);
  const outputPath = path.resolve(cwd, options.output);

  const result = await extractPrayerGuideFromPdf(inputPath, {
    startPage: options.startPage,
    totalDays: options.totalDays,
    startDate: options.startDate,
  });

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");

  const totalPoints = result.days.reduce(
    (sum, day) => sum + day.points.length,
    0,
  );

  console.log(
    [
      `Extracted ${result.days.length} days from ${path.basename(inputPath)}.`,
      `Total points: ${totalPoints}.`,
      `Output: ${outputPath}`,
    ].join(" "),
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Failed to extract prayer guide: ${message}`);
  process.exitCode = 1;
});
