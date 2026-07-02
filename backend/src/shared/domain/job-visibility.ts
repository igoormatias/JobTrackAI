export const JOB_VISIBILITIES = ["VISIBLE", "HIDDEN"] as const;

export type JobVisibility = (typeof JOB_VISIBILITIES)[number];

export const DEFAULT_JOB_VISIBILITY: JobVisibility = "VISIBLE";
