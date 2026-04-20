import { SkeletonTable, Skeleton } from "@/components/skeleton";

export default function MembersLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-32 mb-6" />
      <SkeletonTable rows={4} cols={3} />
    </div>
  );
}
