"use client";

import Link from "next/link";
import type { PrayerGuideDay } from "@repo/fasting";
import { CalendarDays } from "lucide-react";
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
import { formatFastingDateShort } from "../lib";

interface DayPickerDialogProps {
  days: PrayerGuideDay[];
  selectedDay: number;
}

export function DayPickerDialog({ days, selectedDay }: DayPickerDialogProps) {
  if (days.length === 0) return null;

  const selected = days.find((item) => item.day === selectedDay) ?? days[0];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-fit gap-2">
          <CalendarDays className="size-4" />
          <span>{formatFastingDateShort(selected.date)}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Select Day</DialogTitle>
          <DialogDescription>
            Choose a date to open that day&apos;s fasting and prayer guide.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60svh] overflow-y-auto pr-1">
          <div className="grid gap-2">
            {days.map((item) => {
              const isActive = item.day === selectedDay;
              const title = item.prayerFocus || "Fasting and Prayer";

              return (
                <Link
                  key={item.day}
                  href={`/fasting/${item.day}`}
                  className={cn(
                    "rounded-lg border p-3 transition-colors hover:bg-accent",
                    isActive && "border-primary bg-primary/10",
                  )}
                >
                  <p className="text-sm font-semibold">
                    Day {item.day} - {formatFastingDateShort(item.date)}
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">{title}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
