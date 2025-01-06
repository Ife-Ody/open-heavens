import { Transition, Variants } from "motion/react";
import { BibleReader } from "src/app/bible/bible-reader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "src/components/ui/dialog";

export function BibleDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const customVariants: Variants = {
    initial: {
      scale: 0.9,
      filter: "blur(10px)",
      y: "100%",
    },
    animate: {
      scale: 1,
      filter: "blur(0px)",
      y: 0,
    },
  };

  const customTransition: Transition = {
    type: "spring",
    bounce: 0,
    duration: 0.4,
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      variants={customVariants}
      transition={customTransition}
    >
      <DialogContent className="p-6 bg-background">
        <DialogHeader>
          <DialogTitle className="sr-only">Bible</DialogTitle>
        </DialogHeader>
        <BibleReader />
      </DialogContent>
    </Dialog>
  );
}
