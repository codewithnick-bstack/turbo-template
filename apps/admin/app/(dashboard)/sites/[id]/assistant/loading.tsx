import { Skeleton } from "@/components/skeleton";

export default function AssistantLoading() {
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-2xl mx-auto p-4">
      <Skeleton className="h-7 w-36 mb-4" />
      <div className="flex-1 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-10 w-full mt-4" />
    </div>
  );
}
