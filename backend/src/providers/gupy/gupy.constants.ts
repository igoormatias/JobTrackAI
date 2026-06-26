/** Reference: telegram-vagas-gupy-bot/main.py */
export const GUPY_API_URL = "https://employability-portal.gupy.io/api/v1/jobs";

export const GUPY_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  Origin: "https://portal.gupy.io",
} as const;

export const GUPY_DEFAULT_LIMIT = 10;

/** Pagination: offset = (page - 1) * limit. Stop on empty page or stale jobs (> 3 days). */
