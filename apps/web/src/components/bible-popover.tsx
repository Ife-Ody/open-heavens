"use client";

import { useState } from 'react';
import { Button } from "@repo/ui/components/button";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/components/popover";
import { useSettings } from 'src/app/context/settings-context';
import { cn } from '@repo/ui/utils';

interface BiblePopoverProps {
  reference: string;
  content: string;
  onClose?: () => void;
}

export function BiblePopover({ reference, content, onClose }: BiblePopoverProps) {
  const [isOpen, setIsOpen] = useState(true);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open && onClose) {
      onClose();
    }
  };

  const {fontSize} = useSettings();

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="link" className={cn("h-auto p-0", `text-[${fontSize}px]`)} >
          {reference}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-[80vh] overflow-y-auto">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">{reference}</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              {content ? (
                content.split('\n').map((verse, index) => (
                  <p key={index}>{verse}</p>
                ))
              ) : (
                'Loading...'
              )}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
