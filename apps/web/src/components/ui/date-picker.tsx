"use client";

import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@repo/ui/components/button";
import { Calendar } from "@repo/ui/components/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import { CalendarIcon } from "lucide-react";
import { useSettings } from "src/app/context/settings-context";

export function DatePicker() {
  const settings = useSettings();
  const { date, setDate } = settings;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          // disabled
          variant={"outline"}
          className={cn(
            "group bg-background hover:bg-background border-input flex gap-2 items-center w-fit justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon
            size={16}
            className="transition-colors text-muted-foreground/80 group-hover:text-foreground shrink-0"
            aria-hidden="true"
          />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          required
          disabled={{
            before: new Date(2023, 0, 1),
            // after: addDays(new Date(), 1),
            after: new Date(2025, 11, 31),
          }}
        />
        <div className="flex justify-center p-3">
          <Button
            variant={"outline"}
            size="sm"
            className="mt-2 mb-1"
            onClick={() => setDate(new Date())}
          >
            Go to Today: {format(new Date(), "PP")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
