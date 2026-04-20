import { Skeleton } from "@/components/skeleton";

export default function SiteLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-4 w-32 mb-8" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-[var(--border)] px-5 py-4">
            <Skeleton className="h-5 w-5 mb-3 rounded" />
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}
