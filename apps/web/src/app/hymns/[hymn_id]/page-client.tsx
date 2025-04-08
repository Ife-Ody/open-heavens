"use client";

import { Button } from "@repo/ui/components/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@repo/ui/components/pagination";
import { Skeleton } from "@repo/ui/components/skeleton";
import { ArrowLeft, PencilLine } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { hymns as defaultHymns } from "../../content/hymns";
import { getYouTubeEmbedUrl } from "../get-youtube-embed-url";

export default function HymnPageClient({ hymn_id }: { hymn_id: string }) {
  const [hymn, setHymn] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedHymn, setEditedHymn] = useState<any>(null);
  const [allHymns, setAllHymns] = useState<any[]>(defaultHymns);

  useEffect(() => {
    const fetchHymns = async () => {
      try {
        const response = await fetch("/api/hymns");
        if (!response.ok) {
          throw new Error("Failed to fetch hymns");
        }
        const data = await response.json();
        setAllHymns(data.data);
        const foundHymn = data.data.find(
          (h: any) => h.id === parseInt(hymn_id),
        );
        if (foundHymn) {
          setHymn(foundHymn);
          setEditedHymn(foundHymn);
        }
      } catch (error) {
        console.error("Error fetching hymn:", error);
        // Fallback to default hymns if API fails
        const foundHymn = defaultHymns.find((h) => h.id === parseInt(hymn_id));
        if (foundHymn) {
          setHymn(foundHymn);
          setEditedHymn(foundHymn);
        }
      }
    };

    fetchHymns();
  }, [hymn_id]);

  if (!hymn) {
    return (
      <div className="flex flex-col items-center justify-center max-w-4xl gap-3 p-4 mx-auto">
        <Skeleton className="w-full h-6 mb-4" />
        <Skeleton className="w-full mb-4 h-96" />
        {Array(8)
          .fill(null)
          .map((_, index) => (
            <Skeleton key={index} className="w-full h-6 mb-4" />
          ))}
      </div>
    );
  }

  // Get current hymn index and calculate prev/next hymn IDs
  const sortedHymns = [...allHymns].sort(
    (a, b) => a.hymn_number - b.hymn_number,
  );
  const currentIndex = sortedHymns.findIndex((h) => h.id === hymn.id);
  const prevHymn = currentIndex > 0 ? sortedHymns[currentIndex - 1] : null;
  const nextHymn =
    currentIndex < sortedHymns.length - 1
      ? sortedHymns[currentIndex + 1]
      : null;

  const handleSave = async () => {
    const toastId = toast.loading("Saving hymn...");
    try {
      const response = await fetch(`/api/hymns/${hymn_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedHymn),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      const data = await response.json();
      setHymn(data.data);
      setIsEditing(false);
      toast.success("Hymn saved successfully!", { id: toastId });
    } catch (error) {
      console.error("Failed to save hymn:", error);
      toast.error("Failed to save hymn", { id: toastId });
    }
  };

  return (
    <div className="max-w-4xl p-4 py-6 mx-auto">
      <header className="flex flex-col gap-6 pb-6 mb-6 border-b">
        <div className="flex items-center justify-between space-x-2">
          <Link href="/hymns" className="flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to List
          </Link>

          {!isEditing && (
            <>
              {/* Add Pagination */}
              <div className="flex-1">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href={prevHymn ? `/hymns/${prevHymn.id}` : "#"}
                        onClick={(e) => {
                          if (!prevHymn) e.preventDefault();
                        }}
                        className={
                          !prevHymn ? "pointer-events-none opacity-50" : ""
                        }
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
                        onClick={(e) => {
                          if (!nextHymn) e.preventDefault();
                        }}
                        className={
                          !nextHymn ? "pointer-events-none opacity-50" : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
              {window?.location?.hostname === "localhost" && (
                <Button
                  className="flex rounded-full min-w-32"
                  onClick={() => setIsEditing(true)}
                >
                  Edit <PencilLine className="w-4 h-4 ml-2" />
                </Button>
              )}
            </>
          )}
        </div>
        <h1 className="text-2xl font-bold">
          Hymn #{hymn.hymn_number}: {hymn.title}
        </h1>
      </header>

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">Title</label>
            <input
              type="text"
              value={editedHymn.title}
              onChange={(e) =>
                setEditedHymn({ ...editedHymn, title: e.target.value })
              }
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">
              Hymn Number
            </label>
            <input
              type="number"
              value={editedHymn.hymn_number}
              onChange={(e) =>
                setEditedHymn({
                  ...editedHymn,
                  hymn_number: parseInt(e.target.value),
                })
              }
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">
              YouTube URL
            </label>
            <input
              type="text"
              value={editedHymn.hymn_url}
              onChange={(e) =>
                setEditedHymn({ ...editedHymn, hymn_url: e.target.value })
              }
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Lyrics</label>
            <textarea
              value={editedHymn.lyrics}
              onChange={(e) =>
                setEditedHymn({ ...editedHymn, lyrics: e.target.value })
              }
              className="w-full p-2 border rounded min-h-[400px]"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              onClick={() => {
                setEditedHymn(hymn);
                setIsEditing(false);
              }}
              variant="outline"
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      ) : (
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
      )}
    </div>
  );
}
