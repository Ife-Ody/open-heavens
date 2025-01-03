"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@repo/ui/theme";
import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";

const ThemeToggle = function ({ iconOnly = true }: { iconOnly: boolean }) {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {iconOnly ? (
          <Button
            variant="ghost"
            size="icon"
            id="vbtheme-toggle"
            className="focus-visible:ring-0 text-muted-foreground"
          >
            <Sun size={16} className="block dark:hidden" />
            <Moon size={16} className="hidden dark:block" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        ) : (
          <Button
            variant="ghost"
            id="vbtheme-toggle"
            className="inline-flex items-center justify-start w-full gap-2 p-2"
          >
            <Sun
              size={16}
              className="block dark:hidden text-muted-foreground group-hover:text-foreground"
            />
            <Moon
              size={16}
              className="hidden dark:block text-muted-foreground group-hover:text-foreground"
            />
            <span>Theme</span>
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" className="w-48" align="end">
        <DropdownMenuItem
          className="font-medium"
          onClick={() => setTheme("light")}
        >
          <Sun size={16} className="block mr-2 text-muted-foreground" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          className="font-medium"
          onClick={() => setTheme("dark")}
        >
          <Moon size={16} className="block mr-2 text-muted-foreground" />
          Dark
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { ThemeToggle };

//TODO: Ensure the theme toggle applies the theme instantly, maybe use the applicationStore to get this effect.
