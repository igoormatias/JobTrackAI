"use client";

import { useEffect, useRef } from "react";

import type { Job } from "@/types";

import { useJobDetailsMutations } from "../use-job-details-mutations";

export const useMarkJobViewedOnMount = (job: Job | undefined) => {
  const { viewMutation } = useJobDetailsMutations();
  const markedRef = useRef(false);

  useEffect(() => {
    if (!job || markedRef.current || job.engagementState !== "new") return;
    markedRef.current = true;
    viewMutation.mutate(job.id);
  }, [job, viewMutation]);
};
