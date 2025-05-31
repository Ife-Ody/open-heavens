"use client";

import { Button } from "@repo/ui/components/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

const ThemeToggle = function ({ iconOnly = true }: { iconOnly?: boolean }) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size={iconOnly ? "icon" : "default"}
      onClick={toggleTheme}
      id="vbtheme-toggle"
      className={iconOnly 
        ? "focus-visible:ring-0 text-muted-foreground" 
        : "inline-flex items-center justify-start w-full gap-2 p-2"
      }
    >
      {iconOnly ? (
        <>
          <Sun size={16} className="block dark:hidden" />
          <Moon size={16} className="hidden dark:block" />
          <span className="sr-only">Toggle theme</span>
        </>
      ) : (
        <>
          <Sun
            size={16}
            className="block dark:hidden text-muted-foreground group-hover:text-foreground"
          />
          <Moon
            size={16}
            className="hidden dark:block text-muted-foreground group-hover:text-foreground"
          />
          <span>Theme</span>
        </>
      )}
    </Button>
  );
};

export { ThemeToggle };

//TODO: Ensure the theme toggle applies the theme instantly, maybe use the applicationStore to get this effect.
