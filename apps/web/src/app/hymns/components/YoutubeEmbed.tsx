"use client";

import useIntersectionObserver from "@/lib/hooks/use-intersection-observer";
import { getYouTubeEmbedUrl } from "../get-youtube-embed-url";

interface YoutubeEmbedProps {
  url: string;
  title: string;
}

export default function YoutubeEmbed({ url, title }: YoutubeEmbedProps) {
  const [ref, isIntersecting] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: "100px",
  });

  return (
    <div ref={ref as unknown as React.RefObject<HTMLDivElement>}>
      {isIntersecting && (
        <iframe
          src={getYouTubeEmbedUrl(url)}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-56 rounded-lg w-96"
        />
      )}
    </div>
  );
} 