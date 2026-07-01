import { Suspense } from "react";

import { PipelinePage } from "@/features/pipeline";
import { PipelineBoardSkeleton } from "@/features/pipeline/components/PipelineBoardSkeleton";

export default function PipelineRoutePage() {
  return (
    <Suspense fallback={<PipelineBoardSkeleton />}>
      <PipelinePage />
    </Suspense>
  );
}
