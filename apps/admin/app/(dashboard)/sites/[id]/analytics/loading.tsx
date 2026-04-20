import { Skeleton } from "@/components/skeleton";

export default function AnalyticsLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-4 w-24 mb-8" />
      <div className="grid gap-4 sm:grid-cols-2 mb-8">
        <div className="rounded-xl border border-[var(--border)] p-6">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="rounded-xl border border-[var(--border)] p-6">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      <Skeleton className="h-6 w-28 mb-4" />
      <div className="flex items-end gap-1 h-32">
        {Array.from({ length: 30 }).map((_, i) => (
          <Skeleton key={i} className="flex-1" style={{ height: `${20 + Math.random() * 80}%` }} />
        ))}
      </div>
    </div>
  );
}
