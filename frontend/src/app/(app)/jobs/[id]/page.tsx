import { Suspense } from "react";

import { JobDetailsPage } from "@/features/job-details";
import { JobDetailsPageSkeleton } from "@/features/job-details/components/JobDetailsPageSkeleton";

export default function JobDetailsRoutePage() {
  return (
    <Suspense fallback={<JobDetailsPageSkeleton />}>
      <JobDetailsPage />
    </Suspense>
  );
}
