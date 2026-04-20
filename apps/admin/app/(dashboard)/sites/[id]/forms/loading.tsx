import { Skeleton } from "@/components/skeleton";

export default function FormsLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-24 mb-6" />
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3 border border-[var(--border)] rounded-xl">
            <div className="space-y-1">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
