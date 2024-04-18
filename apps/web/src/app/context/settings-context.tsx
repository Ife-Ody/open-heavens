"use client"
import { useTheme } from "next-themes";
import { ReactNode, createContext, useContext, useState } from "react";

export const SettingsContext = createContext({
  theme: "light",
  setTheme: (theme: string) => {},
  fontSize: "md",
  setFontSize: (fontSize: string) => {},
});

export const useSettings = () => {
  if (!SettingsContext) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return useContext(SettingsContext);
};

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const { theme, setTheme } = useTheme();
  const [fontSize, setFontSize] = useState("md");
  return (
    <SettingsContext.Provider
      value={{ theme: theme || "light", setTheme, fontSize, setFontSize }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
