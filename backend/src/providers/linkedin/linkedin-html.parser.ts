import { load } from "cheerio";

import { parseJobPostingSalary } from "../../shared/utils/parse-job-posting-salary.js";
import type { LinkedinRawJob } from "./linkedin.types.js";

const stripQuery = (url: string): string => url.split("?")[0] ?? url;

const extractJobId = (url: string): string | null => {
  const match = url.match(/\/jobs\/view\/(\d+)/i);
  return match?.[1] ?? null;
};

export const parseLinkedinSearchHtml = (html: string): LinkedinRawJob[] => {
  const $ = load(html);
  const jobs: LinkedinRawJob[] = [];

  $("div.base-card").each((_, element) => {
    const card = $(element);
    const titleEl = card.find('[class*="title"]').first();
    const companyEl = card.find('[class*="subtitle"]').first();
    const locationEl = card.find('[class*="location"]').first();
    const linkEl = card.find("a[href]").first();
    const timeEl = card.find("time").first();

    const href = linkEl.attr("href")?.trim() ?? "";
    const sourceUrl = href ? stripQuery(href) : "";
    if (!sourceUrl) return;

    const title = titleEl.text().trim() || "Título indisponível";
    const company = companyEl.text().trim() || "Empresa não informada";
    const location = locationEl.text().trim() || undefined;
    const publishedDate = timeEl.attr("datetime")?.trim() || undefined;
    const externalId = extractJobId(sourceUrl) ?? sourceUrl;

    jobs.push({
      title,
      company,
      location,
      sourceUrl,
      externalId,
      publishedDate,
    });
  });

  return jobs;
};

const extractJobIdFromUrl = (url: string): string | null => {
  const match = url.match(/\/jobs\/view\/(\d+)/i);
  return match?.[1] ?? null;
};

/** LinkedIn often returns a login wall or job-search HTML for /jobs/view/{id} without auth. */
export const isLinkedinJobSearchResultsPage = (html: string, title: string): boolean => {
  const normalizedTitle = title.trim();
  if (!normalizedTitle) return true;

  const searchTitlePatterns = [
    /\d[\d.,]*\s*\+?\s*vagas?\s+(de\s+)?/i,
    /vagas?\s+em\s*:/i,
    /jobs?\s+in\s+/i,
    /^\+?\s*de\s+\d/i,
  ];
  if (searchTitlePatterns.some((pattern) => pattern.test(normalizedTitle))) return true;

  const loginWallMarkers = [
    /Entre para ver mais vagas/i,
    /Sign in to view more jobs/i,
    /authwall/i,
    /join-linkedin/i,
  ];
  if (loginWallMarkers.some((pattern) => pattern.test(html))) return true;

  const $ = load(html);
  if ($("div.base-card").length > 1) return true;
  if ($('[data-tracking-control-name="public_jobs_jserp-result"]').length > 0) return true;

  const hasJobPostingLd = /"@type"\s*:\s*"JobPosting"/i.test(html);
  const hasJobViewLayout =
    $(".top-card-layout__title, .jobs-unified-top-card__job-title, .job-details-jobs-unified-top-card__job-title")
      .length > 0;

  if (!hasJobPostingLd && !hasJobViewLayout && normalizedTitle.split(/\s+/).length > 12) {
    return true;
  }

  return false;
};

const extractSalaryFromJsonLd = (html: string): { salaryMin?: number; salaryMax?: number } => {
  const match = html.match(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i,
  );
  if (!match?.[1]) return {};

  try {
    const parsed = JSON.parse(match[1].trim()) as { "@type"?: string; baseSalary?: unknown };
    if (parsed["@type"] !== "JobPosting") return {};
    const salary = parseJobPostingSalary(parsed.baseSalary);
    if (!salary) return {};
    return { salaryMin: salary.salaryMin, salaryMax: salary.salaryMax };
  } catch {
    return {};
  }
};

export const parseLinkedinJobViewHtml = (html: string, sourceUrl: string): LinkedinRawJob | null => {
  const $ = load(html);
  const externalId = extractJobIdFromUrl(sourceUrl);
  if (!externalId) return null;

  const ogTitle = $('meta[property="og:title"]').attr("content")?.trim();
  const title =
    $("h1.top-card-layout__title, h1").first().text().trim() ||
    ogTitle?.split("|")[0]?.trim() ||
    "";
  const company =
    $("a.topcard__org-name-link, .topcard__flavor--bullet").first().text().trim() ||
    $('meta[property="og:description"]').attr("content")?.split("·")[0]?.trim() ||
    "";
  const location = $(".topcard__flavor--bullet").eq(1).text().trim() || undefined;
  const description =
    $(".description__text, .show-more-less-html").first().text().trim().slice(0, 2000) || undefined;

  if (!title || isLinkedinJobSearchResultsPage(html, title)) return null;

  const salaryFromLd = extractSalaryFromJsonLd(html);

  return {
    title,
    company: company || "Empresa não informada",
    location,
    sourceUrl: stripQuery(sourceUrl),
    externalId,
    description,
    salaryMin: salaryFromLd.salaryMin,
    salaryMax: salaryFromLd.salaryMax,
  };
};
