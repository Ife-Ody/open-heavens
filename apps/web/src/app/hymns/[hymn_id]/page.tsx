import { hymns } from "src/app/content/hymns";
import { constructMetadata, truncate } from "@repo/utils";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@repo/ui/components/pagination";
import { getYouTubeEmbedUrl } from "../get-youtube-embed-url";
import { PencilLine } from "lucide-react";
import { notFound } from "next/navigation";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ hymn_id: string }>;
}) => {
  const { hymn_id } = await params;
  const hymn = hymns.find((hymn) => hymn.id === parseInt(hymn_id));

  if (!hymn) {
    return constructMetadata({
      title: "Hymn Not Found",
      description: "The hymn you are looking for does not exist.",
    });
  }

  return constructMetadata({
    title: truncate(
      `Hymn ${hymn?.hymn_number} - ${hymn?.title} - Open Heavens Hymn`,
      60,
    ) as string,
    description: truncate(hymn?.lyrics, 160) as string,
  });
};

export default async function HymnPage({
  params,
}: {
  params: Promise<{ hymn_id: string }>;
}) {
  const { hymn_id } = await params;
  // Get hymn data
  const hymn = hymns.find((h) => h.id === parseInt(hymn_id));
  
  if (!hymn) {
    return notFound();
  }

  // Get current hymn index and calculate prev/next hymn IDs
  const sortedHymns = [...hymns].sort((a, b) => a.hymn_number - b.hymn_number);
  const currentIndex = sortedHymns.findIndex((h) => h.id === hymn.id);
  const prevHymn = currentIndex > 0 ? sortedHymns[currentIndex - 1] : null;
  const nextHymn =
    currentIndex < sortedHymns.length - 1 ? sortedHymns[currentIndex + 1] : null;

  return (
    <div className="max-w-4xl p-4 py-6 mx-auto">
      <header className="flex flex-col gap-6 pb-6 mb-6 border-b">
        <div className="flex items-center justify-between space-x-2">
          <Link href="/hymns" className="flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to List
          </Link>

          <div className="flex-1">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href={prevHymn ? `/hymns/${prevHymn.id}` : "#"}
                    className={!prevHymn ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                <PaginationItem>
                  <div className="flex items-center p-1 px-2 bg-muted rounded-xl">
                    <span className="text-sm">
                      Hymn {currentIndex + 1} of {sortedHymns.length}
                    </span>
                  </div>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href={nextHymn ? `/hymns/${nextHymn.id}` : "#"}
                    className={!nextHymn ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <Link href={`/hymns/${hymn_id}/edit`}>
              <Button className="flex rounded-full min-w-32">
                Edit <PencilLine className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          )}
        </div>
        <h1 className="text-2xl font-bold">
          Hymn #{hymn.hymn_number}: {hymn.title}
        </h1>
      </header>

      <div className="space-y-6">
        <div className="relative w-full pb-[56.25%]">
          {getYouTubeEmbedUrl(hymn.hymn_url) ? (
            <iframe
              src={getYouTubeEmbedUrl(hymn.hymn_url)}
              title={hymn.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full max-w-3xl shadow-lg rounded-xl aspect-video"
            />
          ) : (
            <div className="absolute top-0 left-0 flex items-center justify-center w-full h-full rounded-lg bg-muted">
              Invalid YouTube URL
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold">YouTube Link:</h2>
          <a
            href={hymn.hymn_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {hymn.hymn_url}
          </a>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Lyrics:</h2>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: hymn.lyrics }}
          />
        </div>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  return hymns.map((hymn) => ({ hymn_id: hymn.id.toString() }));
}
