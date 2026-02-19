import Link from "next/link";
import type { PrayerGuideDay } from "@repo/fasting";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPickerDialog } from "./day-picker-dialog";
import { formatFastingDateLong } from "../lib";
import { BibleTagger } from "@/lib/bible-tagger";
import { BibleReference } from "@/components/bible-reference";

interface FastingDayContentProps {
  days: PrayerGuideDay[];
  selectedDay: PrayerGuideDay;
}

const bibleTagger = new BibleTagger();

export function FastingDayContent({
  days,
  selectedDay,
}: FastingDayContentProps) {
  const selectedDayIndex = days.findIndex((item) => item.day === selectedDay.day);
  const previousDay = selectedDayIndex > 0 ? days[selectedDayIndex - 1] : null;
  const nextDay =
    selectedDayIndex < days.length - 1 ? days[selectedDayIndex + 1] : null;

  const pointsHeading =
    selectedDay.section === "ACTION_POINTS" ? "Action Points" : "Prayer Points";
  const pageTitle = selectedDay.prayerFocus
    ? `Day ${selectedDay.day}: ${selectedDay.prayerFocus}`
    : `Day ${selectedDay.day} Fasting and Prayer`;

  const renderTaggedText = (text: string) => {
    return bibleTagger.parseTextToSegments(text).map((segment, index) => {
      if (segment.type === "reference") {
        return (
          <BibleReference
            key={`${segment.content}-${index}`}
            reference={segment.content}
          />
        );
      }

      return <span key={`text-${index}`}>{segment.content}</span>;
    });
  };

  return (
    <main className="mx-auto container relative flex flex-col items-center justify-center min-h-screen gap-6 p-8 pb-16 md:px-24">
      <article className="flex flex-1 flex-col gap-8 whitespace-normal wrap-break-word">
        <header className="flex flex-col gap-3">
          <DayPickerDialog days={days} selectedDay={selectedDay.day} />
          <time dateTime={selectedDay.date} className="font-light text-muted-foreground">
            {formatFastingDateLong(selectedDay.date)}
          </time>
          <h1 className="text-3xl font-semibold md:text-4xl">{pageTitle}</h1>
        </header>

        {selectedDay.prayerFocus && (
          <section aria-label="Prayer Focus">
            <h2 className="text-lg font-bold uppercase">Prayer Focus</h2>
            <blockquote className="mt-2 border-l-2 p-3 pl-6 italic text-muted-foreground">
              {renderTaggedText(selectedDay.prayerFocus)}
            </blockquote>
          </section>
        )}

        {selectedDay.introduction && (
          <section aria-label="Introduction">
            <h2 className="text-lg font-bold uppercase">Introduction</h2>
            <p className="text-justify">{renderTaggedText(selectedDay.introduction)}</p>
          </section>
        )}

        {(selectedDay.anchorScripture?.length ?? 0) > 0 && (
          <section aria-label="Anchor Scripture">
            <h2 className="text-lg font-bold uppercase">Anchor Scripture</h2>
            <p className="font-semibold text-primary">
              {selectedDay.anchorScripture?.map((scripture, index) => (
                <span key={`${scripture}-${index}`}>
                  {index > 0 ? ", " : ""}
                  {renderTaggedText(scripture)}
                </span>
              ))}
            </p>
          </section>
        )}

        <section aria-label={pointsHeading}>
          <h2 className="text-lg font-bold uppercase">{pointsHeading}</h2>
          <ol className="mt-3 list-decimal space-y-3 pl-5">
            {selectedDay.points.map((point) => (
              <li key={`${selectedDay.day}-${point.index}`}>{renderTaggedText(point.text)}</li>
            ))}
          </ol>
        </section>

        <section aria-label="Navigation" className="mt-6 flex justify-between">
          {previousDay ? (
            <Link
              href={`/fasting/${previousDay.day}`}
              className="flex items-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary/80"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous Day</span>
            </Link>
          ) : (
            <span />
          )}
          {nextDay ? (
            <Link
              href={`/fasting/${nextDay.day}`}
              className="flex items-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary/80"
            >
              <span>Next Day</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <span />
          )}
        </section>
      </article>
    </main>
  );
}
