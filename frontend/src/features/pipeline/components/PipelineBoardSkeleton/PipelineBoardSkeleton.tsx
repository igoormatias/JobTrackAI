import { Skeleton } from "@/components/feedback/Skeleton";

export const PipelineBoardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-20 w-full" />
      ))}
    </div>
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="min-w-[300px] space-y-3">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
        </div>
      ))}
    </div>
  </div>
);

export const PipelineCardSkeleton = () => <Skeleton className="h-36 w-full rounded-lg" />;
