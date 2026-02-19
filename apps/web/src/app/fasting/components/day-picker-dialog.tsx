"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { PrayerGuideDay } from "@repo/fasting";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import { cn } from "@repo/ui/lib/utils";
import { getTodayDateKeyInAppTimeZone } from "@/lib/date";
import { formatFastingDateShort } from "../lib";

interface DayPickerDialogProps {
  days: PrayerGuideDay[];
  selectedDay: number;
}

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getMonthLabel(year: number, monthIndex: number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, monthIndex, 1)));
}

function getDateParts(value: string): { year: number; month: number; day: number } {
  const [year, month, day] = value.split("-").map((part) => Number(part));
  return { year, month, day };
}

export function DayPickerDialog({ days, selectedDay }: DayPickerDialogProps) {
  if (days.length === 0) return null;

  const selected = days.find((item) => item.day === selectedDay) ?? days[0];
  const todayDateKey = getTodayDateKeyInAppTimeZone();

  const months = useMemo(() => {
    const monthMap = new Map<
      string,
      {
        key: string;
        year: number;
        monthIndex: number;
        label: string;
        dayByDateKey: Map<string, PrayerGuideDay>;
      }
    >();

    days.forEach((item) => {
      const { year, month } = getDateParts(item.date);
      const monthIndex = month - 1;
      const key = `${year}-${String(month).padStart(2, "0")}`;
      const current =
        monthMap.get(key) ??
        (() => {
          const created = {
            key,
            year,
            monthIndex,
            label: getMonthLabel(year, monthIndex),
            dayByDateKey: new Map<string, PrayerGuideDay>(),
          };
          monthMap.set(key, created);
          return created;
        })();

      current.dayByDateKey.set(item.date, item);
    });

    return Array.from(monthMap.values()).sort((a, b) => a.key.localeCompare(b.key));
  }, [days]);

  const selectedMonthKey = selected.date.slice(0, 7);
  const [activeMonthKey, setActiveMonthKey] = useState(selectedMonthKey);

  useEffect(() => {
    setActiveMonthKey(selectedMonthKey);
  }, [selectedMonthKey]);

  const activeMonth =
    months.find((month) => month.key === activeMonthKey) ?? months[0] ?? null;
  if (!activeMonth) return null;

  const activeMonthIndex = months.findIndex((month) => month.key === activeMonth.key);
  const previousMonth =
    activeMonthIndex > 0 ? months[activeMonthIndex - 1] : null;
  const nextMonth =
    activeMonthIndex < months.length - 1 ? months[activeMonthIndex + 1] : null;

  const firstDay = new Date(Date.UTC(activeMonth.year, activeMonth.monthIndex, 1));
  const firstDayColumn = (firstDay.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(
    Date.UTC(activeMonth.year, activeMonth.monthIndex + 1, 0),
  ).getUTCDate();
  const totalGridCells = Math.ceil((firstDayColumn + daysInMonth) / 7) * 7;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-fit gap-2">
          <CalendarDays className="size-4" />
          <span>{formatFastingDateShort(selected.date)}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="hidden sm:block">Select Day</DialogTitle>
          <DialogDescription className="hidden sm:block">
            Choose a date to open that day&apos;s fasting and prayer guide.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={!previousMonth}
              onClick={() => previousMonth && setActiveMonthKey(previousMonth.key)}
              aria-label="Previous month"
            >
              <ChevronLeft className="size-4" />
            </Button>

            <p className="text-sm font-semibold">{activeMonth.label}</p>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={!nextMonth}
              onClick={() => nextMonth && setActiveMonthKey(nextMonth.key)}
              aria-label="Next month"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 border border-border/70">
            {WEEKDAY_LABELS.map((label) => (
              <div
                key={label}
                className="text-muted-foreground bg-muted/30 hidden border-b border-r px-2 py-1 text-center text-xs font-medium last:border-r-0 sm:block"
              >
                {label}
              </div>
            ))}

            {Array.from({ length: totalGridCells }).map((_, cellIndex) => {
              const dayNumber = cellIndex - firstDayColumn + 1;
              const inMonth = dayNumber >= 1 && dayNumber <= daysInMonth;

              if (!inMonth) {
                return (
                  <div
                    key={`empty-${cellIndex}`}
                    className="bg-muted/15 min-h-16 border-r border-b last:border-r-0 sm:min-h-20"
                  />
                );
              }

              const dateKey = `${activeMonth.year}-${String(activeMonth.monthIndex + 1).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`;
              const fastingDay = activeMonth.dayByDateKey.get(dateKey);
              const isValid = Boolean(fastingDay);
              const isSelected = fastingDay?.day === selectedDay;
              const isToday = dateKey === todayDateKey;
              const title = fastingDay?.prayerFocus || "Fasting and Prayer";

              return (
                <div
                  key={dateKey}
                  className={cn(
                    "min-h-16 border-r border-b p-2 last:border-r-0 sm:min-h-20",
                    !isValid && "bg-muted/20",
                    isSelected && "bg-primary/10",
                    isToday && "ring-1 ring-inset ring-primary/50",
                  )}
                >
                  {isValid && fastingDay ? (
                    <Link
                      href={`/fasting/${fastingDay.day}`}
                      className="flex h-full flex-col gap-1 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <span
                        className={cn(
                          "text-sm font-medium",
                          isSelected && "text-primary",
                          !isSelected && "text-foreground",
                        )}
                      >
                        {dayNumber}
                      </span>
                      <span className="text-muted-foreground hidden text-xs leading-snug sm:block">
                        {title}
                      </span>
                    </Link>
                  ) : (
                    <span className="text-muted-foreground/40 text-sm">&nbsp;</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
