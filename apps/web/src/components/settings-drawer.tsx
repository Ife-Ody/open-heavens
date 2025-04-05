"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@repo/ui/components/drawer";
import { Cog } from "lucide-react";
import FontsizeSelector from "./fontsize-selector";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@repo/ui/components/button";
import { Toaster } from "@repo/ui/components/sonner";

export const SettingsDrawer = () => {
  return (
    <Drawer>
      <Toaster position="top-center" />
      <DrawerTrigger asChild>
        <Button className="sm:hidden" variant="outline" size="icon" aria-label="Settings">
          <Cog size={16} />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Change Settings</DrawerTitle>
          <div className="flex flex-col items-center justify-center gap-2 py-6">
            <div>Font Size</div>
            <FontsizeSelector></FontsizeSelector>
          </div>
          <div className="flex flex-col items-center justify-center gap-2 py-6">
            <div>Theme</div>
            <ThemeToggle iconOnly={true}  />
          </div>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  );
};
