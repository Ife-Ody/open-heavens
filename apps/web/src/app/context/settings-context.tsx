"use client"
import { useTheme } from "next-themes";
import { ReactNode, createContext, useContext } from "react";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";

interface SettingsContextType {
  theme: string;
  setTheme: (theme: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  date: Date;
  setDate: (date: Date) => void;
}

export const SettingsContext = createContext<SettingsContextType>({
  theme: "light",
  setTheme: (theme: string) => {},
  fontSize: 16,
  setFontSize: (size: number) => {},
  date: new Date(),
  setDate: (date: Date) => {},
});

export const useSettings = () => {
  if (!SettingsContext) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return useContext(SettingsContext);
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { theme, setTheme } = useTheme();
  const [fontSize, setFontSize] = useLocalStorage<number>("fontSize", 16);
  const [date, setDate] = useLocalStorage<Date>("selectedDate", new Date());

  return (
    <SettingsContext.Provider
      value={{ theme: theme || "light", setTheme, fontSize, setFontSize, date, setDate }}
    >
      <div style={{ fontSize: `${fontSize}px` }} suppressHydrationWarning>{children}</div>
    </SettingsContext.Provider>
  );
}
