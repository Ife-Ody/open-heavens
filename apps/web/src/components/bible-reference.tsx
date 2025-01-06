'use client';

import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BibleTagger } from '../lib/bible-tagger';
import { BiblePopover } from './bible-popover';
import { useSettings } from 'src/app/context/settings-context';

interface BibleReferenceProps {
  content: string;
}

export default function BibleReference({ content }: BibleReferenceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tagger] = useState(() => new BibleTagger());
  const [isProcessing, setIsProcessing] = useState(true);
  const [processedContent, setProcessedContent] = useState(content);
  const [references, setReferences] = useState<Array<{
    reference: string;
    content: string;
  }>>([]);
  const settings = useSettings();
  const { fontSize } = settings;

  // Keep track of roots to clean up
  const rootsRef = useRef<Array<{ root: ReturnType<typeof createRoot>; element: HTMLElement }>>([]);
  const mountedRef = useRef(true);

  // Cleanup helper function
  const cleanupRoots = () => {
    if (rootsRef.current.length > 0) {
      requestAnimationFrame(() => {
        if (mountedRef.current) {
          rootsRef.current.forEach(({ root }) => {
            try {
              root.unmount();
            } catch (e) {
              console.error('Error unmounting root:', e);
            }
          });
          rootsRef.current = [];
        }
      });
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    setIsProcessing(true);

    if (!containerRef.current) return;

    const container = containerRef.current;
    
    // Create a temporary div to parse HTML content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    // Get text content to process
    const textContent = tempDiv.textContent || tempDiv.innerText;
    
    // Find all Bible references
    const matches = tagger.findReferences(textContent);
    
    // Create the formatted content with references
    const formattedContent = textContent.replace(
      tagger.getReferenceRegex(),
      (match) => `<span class="bible-reference-placeholder text-[${fontSize}px]" data-reference="${match}">${match}</span>`
    );

    // Set the initial content with references marked but not yet processed
    setProcessedContent(formattedContent);
    
    // Fetch scripture content for each reference
    Promise.all(
      matches.map(async (reference) => {
        const content = await tagger.getScripture(reference);
        return { reference, content };
      })
    ).then((refs) => {
      if (mountedRef.current) {
        setReferences(refs);
        setIsProcessing(false);
      }
    });

    return () => {
      mountedRef.current = false;
      cleanupRoots();
    };
  }, [content]);

  useEffect(() => {
    if (!containerRef.current || !mountedRef.current || isProcessing) return;

    // Clean up existing roots before creating new ones
    cleanupRoots();

    const container = containerRef.current;
    
    // Replace placeholders with React components
    container.querySelectorAll('.bible-reference-placeholder').forEach((placeholder) => {
      const reference = placeholder.getAttribute('data-reference');
      const referenceData = references.find(r => r.reference === reference);
      
      if (reference && referenceData) {
        const span = document.createElement('span');
        span.className = 'bible-reference-mount';
        placeholder.replaceWith(span);
        
        try {
          const root = createRoot(span);
          root.render(
            <BiblePopover 
              reference={referenceData.reference} 
              content={referenceData.content} 
            />
          );
          rootsRef.current.push({ root, element: span });
        } catch (e) {
          console.error('Error creating root:', e);
        }
      }
    });
  }, [references, isProcessing]);

  return (
    <div 
      ref={containerRef} 
      className={`bible-reference-container text-[${fontSize}px]`}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
} 