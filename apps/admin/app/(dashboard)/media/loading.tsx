import { Skeleton } from "@/components/skeleton";

export default function MediaLoading() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-[var(--border)] overflow-hidden">
            <Skeleton className="aspect-video w-full" />
            <div className="px-3 py-2 space-y-1">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
