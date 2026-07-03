import type { Metadata } from "next";
import { Suspense } from "react";

import { JobsPage } from "@/features/jobs";
import { JobsPageSkeleton } from "@/features/jobs/components/JobsPageSkeleton";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Vagas",
  description: "Descubra e filtre vagas de emprego com match inteligente no JobTrack AI.",
  path: "/jobs",
  noIndex: true,
});

export default function JobsRoutePage() {
  return (
    <Suspense fallback={<JobsPageSkeleton />}>
      <JobsPage />
    </Suspense>
  );
}
