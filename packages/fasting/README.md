# @repo/fasting

Utilities and shared types for fasting-related features.

## Extract Prayer Guide JSON

This package can parse the 30-day prayer guide PDF into structured JSON.

Run from the repo root:

```bash
npm run extract:prayer-guide --workspace=packages/fasting
```

Optional flags:

```bash
npm run extract:prayer-guide --workspace=packages/fasting -- \
  --input "src/2026 Prayer Guide - 30 days Fasting and Prayer.pdf" \
  --output "src/2026-prayer-guide.json" \
  --start-page 3 \
  --days 30 \
  --start-date 2026-02-01
```

Output shape per day:

- `day`
- `page`
- `date`
- `section`
- `points[]` with `{ index, text }`

## Extract Header Fields From Images

If PDF headers are image-only, you can enrich each day with:

- `prayerFocus`
- `introduction`
- `anchorScripture[]`

Run from the repo root:

```bash
npm run extract:prayer-guide-headers --workspace=packages/fasting
```

By default this processes image pages `03..32` (30 days).

Optional flags:

```bash
npm run extract:prayer-guide-headers --workspace=packages/fasting -- \
  --images-dir "src/2026 Prayer Guide - 30 days Fasting and Prayer images" \
  --input "src/2026-prayer-guide.json" \
  --output "src/2026-prayer-guide.json" \
  --start-page 3 \
  --end-page 32 \
  --model "gpt-4o-2024-08-06" \
  --force
```

## Verify And Fix Prayer Points From Images

This checks `points` per day against page images and auto-corrects mismatches.
It is useful for missed or duplicated indexes from PDF text extraction.

Run from the repo root:

```bash
npm run verify:prayer-guide-points --workspace=packages/fasting -- \
  --start-page 3 \
  --end-page 32
```

Optional flags:

```bash
npm run verify:prayer-guide-points --workspace=packages/fasting -- \
  --day 11 \
  --retries 2 \
  --force
```

## Rewrite Scripture References To Full Book Names

Uses OpenAI with a strict schema prompt to normalize scripture references
across all days (for example: `Gal 5:16` -> `Galatians 5:16`).

Run from the repo root:

```bash
npm run rewrite:scripture-references --workspace=packages/fasting
```

Optional flags:

```bash
npm run rewrite:scripture-references --workspace=packages/fasting -- \
  --day 23 \
  --model "gpt-4o-2024-08-06" \
  --retries 2
```
