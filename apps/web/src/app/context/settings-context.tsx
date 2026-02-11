"use client";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import { format, isValid, parseISO } from "date-fns";
import { useTheme } from "next-themes";
import { useParams, useRouter } from "next/navigation";
import { ReactNode, createContext, useContext } from "react";

interface SettingsContextType {
  theme: string;
  setTheme: (theme: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  date: Date;
  setDate: (date: Date) => void;
  version: string;
  setVersion: (version: string) => void;
}

export const SettingsContext = createContext<SettingsContextType>({
  theme: "light",
  setTheme: (theme: string) => {},
  fontSize: 16,
  setFontSize: (size: number) => {},
  date: new Date(),
  setDate: (date: Date) => {},
  version: "kjv",
  setVersion: (version: string) => {},
});

export const useSettings = () => {
  if (!SettingsContext) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return useContext(SettingsContext);
};

const DATE_PARAM_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { theme, setTheme } = useTheme();
  const [fontSize, setFontSize] = useLocalStorage<number>("fontSize", 24);
  const router = useRouter();
  const [version, setVersion] = useLocalStorage<string>("version", "kjv");
  //attempt to get the date from the url
  const dateParam = useParams().date as string | undefined;
  const parsedDate =
    dateParam && DATE_PARAM_PATTERN.test(dateParam) ? parseISO(dateParam) : null;
  const date = parsedDate && isValid(parsedDate) ? parsedDate : new Date();

  const setDate = (date: Date) => {
    router.push(`/${format(date, "yyyy-MM-dd")}`);
  };

  return (
    <SettingsContext.Provider
      value={{
        theme: theme || "light",
        setTheme,
        fontSize,
        setFontSize,
        date,
        setDate,
        version,
        setVersion,
      }}
    >
      <div
        className="h-full"
        style={{ fontSize: `${fontSize}px` }}
        suppressHydrationWarning
      >
        {children}
      </div>
    </SettingsContext.Provider>
  );
}
