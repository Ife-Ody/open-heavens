"use client";

import { Button } from "@repo/ui/components/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { hymns as defaultHymns } from "../../../content/hymns";
import { useParams } from "next/navigation";

type Params = {
  hymn_id: string;
};

export default function EditHymnPage() {
  const params = useParams<Params>();
  const { hymn_id } = params;
  const [hymn, setHymn] = useState<any>(null);
  const [editedHymn, setEditedHymn] = useState<any>(null);

  useEffect(() => {
    // Redirect if not on localhost
    if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
      window.location.href = `/hymns/${params.hymn_id}`;
      return;
    }
  }, [params.hymn_id]);

  useEffect(() => {
    const fetchHymns = async () => {
      try {
        const response = await fetch("/api/hymns");
        if (!response.ok) {
          throw new Error("Failed to fetch hymns");
        }
        const data = await response.json();
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
  }, [params.hymn_id]);

  if (!hymn) {
    return <div>Loading...</div>;
  }

  const handleSave = async () => {
    const toastId = toast.loading("Saving hymn...");
    try {
      const response = await fetch(`/api/hymns/${params.hymn_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedHymn),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      await response.json();
      toast.success("Hymn saved successfully!", { id: toastId });
      window.location.href = `/hymns/${params.hymn_id}`;
    } catch (error) {
      console.error("Failed to save hymn:", error);
      toast.error("Failed to save hymn", { id: toastId });
    }
  };

  return (
    <div className="max-w-4xl p-4 py-6 mx-auto">
      <header className="flex flex-col gap-6 pb-6 mb-6 border-b">
        <div className="flex items-center justify-between space-x-2">
          <Link href={`/hymns/${params.hymn_id}`} className="flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hymn
          </Link>
        </div>
        <h1 className="text-2xl font-bold">
          Editing Hymn #{hymn.hymn_number}: {hymn.title}
        </h1>
      </header>

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
          <Link href={`/hymns/${params.hymn_id}`}>
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </div>
  );
}
