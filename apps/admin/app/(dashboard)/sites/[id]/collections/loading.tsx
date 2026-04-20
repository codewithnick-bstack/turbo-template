import { Skeleton, SkeletonCard } from "@/components/skeleton";

export default function CollectionsLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-40 mb-6" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
