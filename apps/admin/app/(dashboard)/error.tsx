"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-sm font-medium text-[var(--muted-foreground)] mb-2">Something went wrong</p>
      <p className="text-xs text-[var(--muted-foreground)] mb-6 max-w-sm">{error.message}</p>
      <button
        onClick={reset}
        className="rounded border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--border)] transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
