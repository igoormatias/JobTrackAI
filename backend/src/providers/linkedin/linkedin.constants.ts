/** Reference: telegram-vagas-gupy-bot/main.py — LinkedIn guest API */
export const LINKEDIN_JOBS_API_URL =
  "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search";

export const LINKEDIN_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml",
} as const;

export const LINKEDIN_DEFAULT_PARAMS = {
  f_TPR: "r259200",
} as const;
