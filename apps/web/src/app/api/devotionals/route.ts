import { getDevotionalDates, getDevotionalPostByDate } from "@/lib/devotionals";
import { NextRequest, NextResponse } from "next/server";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: NextRequest) {
  try {
    const date = request.nextUrl.searchParams.get("date");
    const audience = request.nextUrl.searchParams.get("audience") ?? undefined;
    const languageCode =
      request.nextUrl.searchParams.get("lang") ?? undefined;

    if (!date) {
      const dates = await getDevotionalDates(audience);
      return NextResponse.json({ success: true, data: dates });
    }

    if (!ISO_DATE_PATTERN.test(date)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid date format. Use YYYY-MM-DD.",
        },
        { status: 400 },
      );
    }

    const post = await getDevotionalPostByDate(date, {
      audience,
      languageCode,
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: "Devotional not found for the given date." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    console.error("Error loading devotionals from SQLite:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load devotionals" },
      { status: 500 },
    );
  }
}
