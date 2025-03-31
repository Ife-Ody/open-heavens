"use client"
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
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

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { theme, setTheme } = useTheme();
  const [fontSize, setFontSize] = useLocalStorage<number>("fontSize", 24);
  const router = useRouter();
  const [version, setVersion] = useLocalStorage<string>("version", "kjv");
  //attempt to get the date from the url
  const dateParam = useParams().date as string | undefined;
  const date = dateParam ? new Date(dateParam) : new Date();

  const setDate = (date: Date) => {
    router.push(`/${date.toISOString().split('T')[0]}`);
  }

  return (
    <SettingsContext.Provider
      value={{ theme: theme || "light", setTheme, fontSize, setFontSize, date, setDate, version, setVersion }}
    >
      <div className="h-full" style={{ fontSize: `${fontSize}px` }} suppressHydrationWarning>{children}</div>
    </SettingsContext.Provider>
  );
}
