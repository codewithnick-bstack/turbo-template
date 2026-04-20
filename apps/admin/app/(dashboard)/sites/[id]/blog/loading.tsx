import { SkeletonTable, Skeleton } from "@/components/skeleton";

export default function BlogLoading() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-9 w-28 rounded" />
      </div>
      <SkeletonTable rows={5} cols={4} />
    </div>
  );
}
