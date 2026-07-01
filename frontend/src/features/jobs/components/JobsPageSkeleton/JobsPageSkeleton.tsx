import { Skeleton } from "@/components/feedback/Skeleton";

import { JobCardSkeleton } from "../JobCardSkeleton";

export const JobsPageSkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
    </div>
    <Skeleton className="h-10 w-full" />
    <div className="hidden gap-2 lg:flex">
      <Skeleton className="h-9 w-28" />
      <Skeleton className="h-9 w-28" />
      <Skeleton className="h-9 w-28" />
    </div>
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <JobCardSkeleton key={index} />
      ))}
    </div>
  </div>
);
