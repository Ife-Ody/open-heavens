"use client";

import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@repo/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import { useState } from "react";
import { useSettings } from "src/app/context/settings-context";
import { useMediaQuery } from "@repo/ui/lib/hooks/use-media-query";

interface BiblePopoverProps {
  reference: string;
  content: string;
  onClose?: () => void;
}

export function BiblePopover({
  reference,
  content,
  onClose,
}: BiblePopoverProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { isMobile } = useMediaQuery();

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open && onClose) {
      onClose();
    }
  };

  const settings = useSettings();
  const { fontSize } = settings;

  const renderVerses = () => (
    <div className="space-y-2">
      <h1 className="font-medium leading-none">{reference}</h1>
      <div className="space-y-2 text-sm text-muted-foreground">
        {content ? (
          content.split("\n").map((verse, index) => (
            <p key={index} style={{ fontSize: `${fontSize}px` }}>
              {verse}
            </p>
          ))
        ) : (
          <p style={{ fontSize: `${fontSize}px` }}>Loading...</p>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={handleOpenChange}>
        <DrawerTrigger asChild>
          <Button
            variant="link"
            className="h-auto p-0"
            style={{ fontSize: `${fontSize}px` }}
            aria-label={reference}
          >
            {reference}
          </Button>
        </DrawerTrigger>
        <DrawerContent className="px-4 pt-2 pb-6">
          <div className="grid gap-4 mt-4">{renderVerses()}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="link"
          className="h-auto p-0"
          style={{ fontSize: `${fontSize}px` }}
          aria-label={reference}
        >
          {reference}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 max-h-[80vh] overflow-y-auto"
        aria-label={reference}
      >
        <div className="grid gap-4">{renderVerses()}</div>
      </PopoverContent>
    </Popover>
  );
}
