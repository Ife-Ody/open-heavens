"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function HomeRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/${toLocalDateKey(new Date())}`);
  }, [router]);

  return (
    <main className="mx-auto container flex min-h-screen items-center justify-center p-8">
      <p>Redirecting...</p>
    </main>
  );
}
