import { Suspense } from "react";

import { HiddenJobsPage } from "@/features/jobs/pages/HiddenJobsPage/HiddenJobsPage";
import { JobsPageSkeleton } from "@/features/jobs/components/JobsPageSkeleton";

export default function Page() {
  return (
    <Suspense fallback={<JobsPageSkeleton />}>
      <HiddenJobsPage />
    </Suspense>
  );
}
