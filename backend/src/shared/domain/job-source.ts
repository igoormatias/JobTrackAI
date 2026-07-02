export const JOB_SOURCES = ["gupy", "linkedin", "programathor", "manual"] as const;

export type JobSource = (typeof JOB_SOURCES)[number];
