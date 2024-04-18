"use client";

import { cn } from "@/lib/utils";
import { useSettings } from "src/app/context/settings-context";
import { Button } from "./ui/button";

const fontSizes = ["sm", "md", "lg", "xl", "2xl"];

function getNextFontSize(current: string) {
  const currentIndex = fontSizes.indexOf(current);
  if (currentIndex >= fontSizes.length - 1) return current;
  const nextIndex = currentIndex + 1;
  return fontSizes[nextIndex] ?? "md";
}

function getPreviousFontSize(current: string) {
  const currentIndex = fontSizes.indexOf(current);
  if (currentIndex <= 0) return current;
  const nextIndex = currentIndex - 1;
  return fontSizes[nextIndex] ?? "md";
}

const FontsizeSelector = ({ sample = true }) => {
  const settings = useSettings();
  const { fontSize, setFontSize } = settings;
  return (
    <div className="flex items-center justify-center gap-3 rounded-md">
      <Button
        variant="outline"
        size="icon"
        className="text-xs"
        onClick={() => {
          setFontSize(getPreviousFontSize(fontSize));
        }}
      >
        A
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="text-xl"
        onClick={() => {
          setFontSize(getNextFontSize(fontSize));
        }}
      >
        A
      </Button>
      {sample && (
        <div className={cn("bg-muted rounded h-full px-1 text-center items-center justify-center flex", `text-${fontSize}`)}>
          Sample Text
        </div>
      )}
    </div>
  );
};

export default FontsizeSelector;
