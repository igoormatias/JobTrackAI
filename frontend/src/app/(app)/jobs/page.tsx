import { Suspense } from "react";

import { JobsPage } from "@/features/jobs";
import { JobsPageSkeleton } from "@/features/jobs/components/JobsPageSkeleton";

export default function JobsRoutePage() {
  return (
    <Suspense fallback={<JobsPageSkeleton />}>
      <JobsPage />
    </Suspense>
  );
}
