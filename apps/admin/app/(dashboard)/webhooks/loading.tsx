import { Skeleton, SkeletonCard } from "@/components/skeleton";

export default function WebhooksLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-32 mb-6" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
