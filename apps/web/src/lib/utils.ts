import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function titleCase(str: string) {
  return str
    .toLowerCase()
    .split(" ")
    .map(function (word) {
      if (!word) return "";
      const firstChar = word[0];
      return firstChar
        ? word.replace(firstChar, firstChar.toUpperCase())
        : word;
    })
    .join(" ");
}
