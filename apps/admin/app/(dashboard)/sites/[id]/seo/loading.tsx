import { Skeleton } from "@/components/skeleton";

export default function SeoLoading() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Skeleton className="h-8 w-40 mb-2" />
      <Skeleton className="h-4 w-64 mb-8" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between border border-[var(--border)] rounded-lg px-4 py-3">
            <div className="space-y-1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16 rounded-md" />
              <Skeleton className="h-8 w-28 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
