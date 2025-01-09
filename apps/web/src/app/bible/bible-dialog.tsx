import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { ScrollArea } from "@repo/ui/components/scroll-area";
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
      <DialogContent className="h-[90vh] w-[95vw] max-w-3xl p-0 sm:px-3 py-3 bg-background [&>button]:hidden">
        <DialogHeader className="w-full">
          <BibleHeader />
          <DialogTitle className="sr-only">Bible</DialogTitle>
        </DialogHeader>
        <ScrollArea className="w-full h-full border-t">
          <BibleReaderBody className="w-full mt-3" />
        </ScrollArea>
        <DialogFooter className="w-full p-0">
          <BibleReaderFooter className="w-full px-3 py-0 mb-0 md:py-3" />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
