"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
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
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="mt-3 max-w-md text-sm text-slate-500 dark:text-slate-400">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      {error.digest ? (
        <p className="mt-1 font-mono text-xs text-slate-400 dark:text-slate-600">
          Error ID: {error.digest}
        </p>
      ) : null}
      <div className="mt-6">
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
