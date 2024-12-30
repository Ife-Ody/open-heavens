"use client";

import { addDays, format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { SelectSingleEventHandler } from "react-day-picker";
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
            "w-[240px] justify-start text-left font-normal",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon size={16} className="mr-2"></CalendarIcon>
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          disabled={{
            before: new Date(2023, 0, 1),
            // after: addDays(new Date(), 1),
            after: new Date(2024, 11, 31),
          }}
          onSelect={setDate as SelectSingleEventHandler}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
