export const JOB_SOURCES = [
  "gupy",
  "linkedin",
  "programathor",
  "manual",
  "referral",
  "recruiter",
  "company_site",
  "other",
] as const;

export type JobSource = (typeof JOB_SOURCES)[number];
