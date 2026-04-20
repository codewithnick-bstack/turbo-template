import { SkeletonTable, Skeleton } from "@/components/skeleton";

export default function AuditLogLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-32 mb-6" />
      <SkeletonTable rows={10} cols={5} />
    </div>
  );
}
