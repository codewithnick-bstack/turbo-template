import { Skeleton } from "@/components/skeleton";

export default function NewBlogPostLoading() {
  return (
    <div className="max-w-2xl">
      <Skeleton className="h-8 w-28 mb-8" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-3 w-16 mb-2" />
            <Skeleton className={`h-${i === 2 ? "32" : "10"} w-full`} />
          </div>
        ))}
        <Skeleton className="h-9 w-32" />
      </div>
    </div>
  );
}
