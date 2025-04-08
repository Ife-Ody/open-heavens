'use client';

import Link from 'next/link';
import { getYouTubeEmbedUrl } from '../get-youtube-embed-url';
import useIntersectionObserver from '@/lib/hooks/use-intersection-observer';

interface HymnCardProps {
  hymn: {
    id: number;
    hymn_number: number;
    title: string;
    hymn_url: string;
    hymn_image?: string;
    lyrics?: string;
  };
}

export default function HymnCard({ hymn }: HymnCardProps) {
  const [ref, isIntersecting] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px',
  });

  return (
    <Link 
      key={hymn.id}
      href={`/hymns/${hymn.id}`}
      className="p-4 transition-colors border rounded hover:bg-muted"
    >
      <div className="flex items-center justify-between">
        <div ref={ref as unknown as React.RefObject<HTMLDivElement>}>
          <span className="font-medium">#{hymn.hymn_number}</span>
          <h2 className="text-lg font-semibold">{hymn.title}</h2>
          {isIntersecting && (
            <iframe
              src={getYouTubeEmbedUrl(hymn.hymn_url)}
              title={hymn.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-56 rounded-lg w-96"
            />
          )}
        </div>
        <svg 
          className="w-6 h-6 text-muted-foreground" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 5l7 7-7 7" 
          />
        </svg>
      </div>
    </Link>
  );
} 