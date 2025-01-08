'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getYouTubeEmbedUrl } from './get-youtube-embed-url';
import { hymns as defaultHymns } from '../content/hymns'; 
import useIntersectionObserver from '@/lib/hooks/use-intersection-observer';

interface HymnCardProps {
  hymn: any;
}

function HymnCard({ hymn }: HymnCardProps) {
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

export default function HymnsListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [hymns, setHymns] = useState(defaultHymns);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHymns = async () => {
      try {
        const response = await fetch('/api/hymns');
        if (!response.ok) {
          throw new Error('Failed to fetch hymns');
        }
        const data = await response.json();
        setHymns(data.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching hymns:', err);
        setError('Failed to load hymns. Using fallback data.');
        setHymns(defaultHymns);
      } finally {
        setLoading(false);
      }
    };

    fetchHymns();
  }, []);

  const filteredHymns = hymns
    .filter(hymn => 
      hymn.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hymn.hymn_number.toString().includes(searchTerm)
    )
    .sort((a, b) => a.hymn_number - b.hymn_number);

  if (loading) {
    return (
      <div className="max-w-4xl p-4 mx-auto">
        <div className="flex items-center justify-center h-32">
          Loading hymns...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl p-4 mx-auto">
      {error && (
        <div className="p-4 mb-4 rounded-md text-amber-800 bg-amber-100">
          {error}
        </div>
      )}
      
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Hymns Directory</h1>
        <div className="w-64">
          <input
            type="text"
            placeholder="Search hymns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredHymns.map(hymn => (
          <HymnCard key={hymn.id} hymn={hymn} />
        ))}
      </div>
    </div>
  );
} 