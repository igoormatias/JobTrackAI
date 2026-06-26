/** Reference: telegram-vagas-gupy-bot/main.py — LinkedIn guest API */
export const LINKEDIN_JOBS_API_URL =
  "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search";

export const LINKEDIN_DEFAULT_PARAMS = {
  f_TPR: "r259200",
  f_WT: "2",
} as const;

export type LinkedinRawJob = {
  title: string;
  company: string;
  url: string;
  location?: string;
};
