"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

export default function SearchHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");

  const debouncedSearch = useDebouncedCallback(
    useCallback(
      (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
          params.set("q", value);
        } else {
          params.delete("q");
        }
        router.push(`/hymns?${params.toString()}`);
      },
      [router, searchParams],
    ),
    300, // 300ms delay
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  return (
    <input
      type="text"
      placeholder="Search hymns..."
      value={searchTerm}
      onChange={handleSearch}
      className="w-full p-2 border rounded"
    />
  );
}
