/** Reference: telegram-vagas-gupy-bot/main.py — ProgramaThor HTML scraping */
export const PROGRAMATHOR_BASE_URL = "https://programathor.com.br";

export const PROGRAMATHOR_JOBS_URL = `${PROGRAMATHOR_BASE_URL}/jobs`;

/** Typical page size on ProgramaThor listing (varies slightly per page). */
export const PROGRAMATHOR_DEFAULT_PAGE_SIZE = 16;

export const PROGRAMATHOR_SELECTORS = {
  card: "div.cell-list",
  location: ".cell-list-content-icon span",
  tags: "span.tag-list",
} as const;

export const PROGRAMATHOR_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "pt-BR,pt;q=0.9",
} as const;
