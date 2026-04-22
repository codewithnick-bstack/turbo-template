import { Skeleton } from "@/components/skeleton";

export default function SiteSettingsLoading() {
  return (
    <div className="max-w-lg">
      <Skeleton className="h-8 w-32 mb-8" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        <Skeleton className="h-9 w-28 mt-2" />
      </div>
    </div>
  );
}
