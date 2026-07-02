import { Skeleton } from "@/components/feedback/Skeleton";

export const SettingsFormSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-48 w-full rounded-xl" />
    <Skeleton className="h-64 w-full rounded-xl" />
  </div>
);
