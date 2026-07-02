export const JOB_PRIORITIES = ["HIGH", "MEDIUM", "LOW"] as const;

export type JobPriority = (typeof JOB_PRIORITIES)[number];

export const DEFAULT_JOB_PRIORITY: JobPriority = "MEDIUM";
