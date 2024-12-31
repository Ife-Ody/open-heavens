'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { BiblePopover } from './bible-popover';

interface PopoverState {
  reference: string;
  content: string;
  x: number;
  y: number;
}

export function BibleReferencePortal() {
  const [popover, setPopover] = useState<PopoverState | null>(null);

  useEffect(() => {
    const handleBibleReference = (event: CustomEvent<PopoverState>) => {
      setPopover(event.detail);
    };

    window.addEventListener('bible-reference', handleBibleReference as EventListener);
    return () => {
      window.removeEventListener('bible-reference', handleBibleReference as EventListener);
    };
  }, []);

  if (!popover) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        left: popover.x,
        top: popover.y,
        zIndex: 1000,
      }}
    >
      <BiblePopover
        reference={popover.reference}
        content={popover.content}
        onClose={() => setPopover(null)}
      />
    </div>,
    document.body
  );
} 