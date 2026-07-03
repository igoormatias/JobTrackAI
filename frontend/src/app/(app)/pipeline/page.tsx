import type { Metadata } from "next";
import { Suspense } from "react";

import { PipelinePage } from "@/features/pipeline";
import { PipelineBoardSkeleton } from "@/features/pipeline/components/PipelineBoardSkeleton";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Pipeline",
  description: "Acompanhe seus processos seletivos em um Kanban visual no JobTrack AI.",
  path: "/pipeline",
  noIndex: true,
});

export default function PipelineRoutePage() {
  return (
    <Suspense fallback={<PipelineBoardSkeleton />}>
      <PipelinePage />
    </Suspense>
  );
}
