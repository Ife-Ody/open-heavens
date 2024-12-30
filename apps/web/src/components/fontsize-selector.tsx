"use client";

import { useSettings } from "src/app/context/settings-context";
import { Button } from "./ui/button";

const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 32;
const STEP_SIZE = 2;

const FontsizeSelector = ({ sample = true }) => {
  const { fontSize, setFontSize } = useSettings();

  const decrease = () => {
    setFontSize(Math.max(MIN_FONT_SIZE, fontSize - STEP_SIZE));
  };

  const increase = () => {
    setFontSize(Math.min(MAX_FONT_SIZE, fontSize + STEP_SIZE));
  };

  return (
    <div className="flex items-center justify-center gap-3 rounded-md">
      <Button
        variant="outline"
        size="icon"
        className="text-xs"
        onClick={decrease}
        disabled={fontSize <= MIN_FONT_SIZE}
      >
        A
      </Button>
      <span className="min-w-[3ch] text-center text-lg">{fontSize}px</span>
      <Button
        variant="outline"
        size="icon"
        className="text-xl"
        onClick={increase}
        disabled={fontSize >= MAX_FONT_SIZE}
      >
        A
      </Button>
      {sample && (
        <p className="flex items-center justify-center h-full px-2 rounded bg-muted">
          Sample Text
        </p>
      )}
    </div>
  );
};

export default FontsizeSelector;
