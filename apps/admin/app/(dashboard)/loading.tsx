import { SkeletonCard, Skeleton } from "@/components/skeleton";

export default function DashboardLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-40 mb-6" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <div className="mt-10 space-y-2">
        <Skeleton className="h-4 w-32 mb-3" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-[var(--border)] px-4 py-3 flex items-center justify-between">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
