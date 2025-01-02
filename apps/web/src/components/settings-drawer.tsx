import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Cog } from "lucide-react";
import FontsizeSelector from "./fontsize-selector";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@repo/ui";

export const SettingsDrawer = () => {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className="sm:hidden" variant="outline" size="icon">
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
            <ThemeToggle />
          </div>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  );
};
