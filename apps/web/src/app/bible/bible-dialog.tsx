import {} from "@/components/ui/drawer";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@repo/ui/components/drawer";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import { useMediaQuery } from "@repo/ui/lib/hooks/use-media-query";
import { X } from "lucide-react";
import { BibleReaderBody, BibleReaderFooter } from "src/app/bible/bible-reader";
import { BibleHeader } from "./components/bible-header";

export function BibleDialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const { isMobile } = useMediaQuery();
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        {children}
        <DrawerContent className="px-2 pb-6 h-[95svh]">
          <DrawerHeader className="flex flex-row items-center w-full px-1 py-0">
            <BibleHeader className="flex-1" />
            <DrawerTitle className="sr-only">Bible</DrawerTitle>
          </DrawerHeader>
          <ScrollArea className="flex-1 w-full h-full border-t">
            <BibleReaderBody className="w-full mt-3" />
          </ScrollArea>
          <DrawerFooter className="w-full p-0">
            <BibleReaderFooter className="w-full px-3 py-0 mb-0 md:py-3" />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
      <DialogContent className="h-[90svh] w-[95svw] max-w-3xl p-0 sm:px-2 py-2 bg-background [&>button]:hidden flex flex-col">
        <DialogHeader className="flex flex-row items-center w-full px-1">
          <BibleHeader className="flex-1" />
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              onOpenChange(false);
            }}
            className="flex-shrink-0"
          >
            <X className="w-4 h-4 sm:hidden" />
          </Button>
          <DialogTitle className="sr-only">Bible</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 w-full h-full border-t">
          <BibleReaderBody className="w-full mt-3" />
        </ScrollArea>
        <DialogFooter className="w-full p-0">
          <BibleReaderFooter className="w-full px-3 py-0 mb-0 md:py-3" />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
