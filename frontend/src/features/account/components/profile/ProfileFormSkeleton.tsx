import { Skeleton } from "@/components/feedback/Skeleton";

export const ProfileFormSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-36 w-full rounded-xl" />
    <Skeleton className="h-80 w-full rounded-xl" />
  </div>
);
