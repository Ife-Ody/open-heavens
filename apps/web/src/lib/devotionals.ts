import "server-only";

import { format } from "date-fns";
import type { Post } from "@/content/posts";
import { prisma } from "@/lib/prisma";

type GetDevotionalOptions = {
  audience?: string;
  languageCode?: string;
};

type DevotionalRow = {
  id: number;
  date: string;
  biblePlan: string | null;
  bibleMemoryVerse: string | null;
  bibleText: string | null;
  reviewImage: string | null;
  reviewUrl: string | null;
  hymnAudioId: number | null;
  createdAt: string | null;
  updatedAt: string | null;
};

type DevotionalTranslationRow = {
  title: string | null;
  memoryText: string | null;
  devotionalHtml: string | null;
  pointText: string | null;
  pointType: string | null;
  reviewTitle: string | null;
  status: string | null;
};

const DEFAULT_LANGUAGE_CODE = "en";

const normalizeDate = (input: Date | string): string => {
  if (typeof input === "string") {
    return input.split("T")[0];
  }

  return format(input, "yyyy-MM-dd");
};

const mapToPost = (
  devotional: DevotionalRow,
  translation: DevotionalTranslationRow | null,
): Post => {
  return {
    id: devotional.id,
    date: devotional.date,
    title: translation?.title ?? "Untitled",
    read: devotional.bibleText ?? "",
    memorizeText: translation?.memoryText ?? "",
    memorizeVerse: devotional.bibleMemoryVerse ?? "",
    bodyText: translation?.devotionalHtml ?? "",
    pointText: translation?.pointText ?? null,
    pointHeader: translation?.pointType ?? null,
    bibleInOneYear: devotional.biblePlan ?? "",
    status: translation?.status ?? null,
    review_title: translation?.reviewTitle ?? null,
    review_image: devotional.reviewImage ?? null,
    review_link: devotional.reviewUrl ?? null,
    hymn_id: devotional.hymnAudioId ?? undefined,
    created_at: devotional.createdAt ?? null,
    updated_at: devotional.updatedAt ?? null,
    deleted_at: null,
  };
};

export async function getDevotionalPostByDate(
  date: Date | string,
  options: GetDevotionalOptions = {},
): Promise<Post | null> {
  const dateKey = normalizeDate(date);
  const languageCode = options.languageCode ?? DEFAULT_LANGUAGE_CODE;

  const devotional = await prisma.devotionals.findFirst({
    where: {
      date: dateKey,
      ...(options.audience ? { audience: options.audience } : {}),
    },
    include: {
      devotional_translations: {
        where: {
          languageCode,
        },
        orderBy: [{ isActive: "desc" }, { id: "asc" }],
      },
    },
    orderBy: {
      id: "asc",
    },
  });

  if (!devotional) {
    return null;
  }

  const translation =
    devotional.devotional_translations[0] ??
    (await prisma.devotional_translations.findFirst({
      where: { devotionalId: devotional.id },
      orderBy: [{ isActive: "desc" }, { id: "asc" }],
    }));

  return mapToPost(devotional, translation);
}

export async function getLatestDevotionalPost(
  options: GetDevotionalOptions = {},
): Promise<Post | null> {
  const languageCode = options.languageCode ?? DEFAULT_LANGUAGE_CODE;

  const devotional = await prisma.devotionals.findFirst({
    where: options.audience ? { audience: options.audience } : undefined,
    include: {
      devotional_translations: {
        where: {
          languageCode,
        },
        orderBy: [{ isActive: "desc" }, { id: "asc" }],
      },
    },
    orderBy: [{ date: "desc" }, { id: "desc" }],
  });

  if (!devotional) {
    return null;
  }

  const translation =
    devotional.devotional_translations[0] ??
    (await prisma.devotional_translations.findFirst({
      where: { devotionalId: devotional.id },
      orderBy: [{ isActive: "desc" }, { id: "asc" }],
    }));

  return mapToPost(devotional, translation);
}

export async function getDevotionalDates(audience?: string): Promise<string[]> {
  const rows = await prisma.devotionals.findMany({
    select: { date: true },
    where: audience ? { audience } : undefined,
    distinct: ["date"],
    orderBy: { date: "asc" },
  });

  return rows.map((row: { date: string }) => row.date);
}
