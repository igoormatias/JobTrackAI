import type { GupyRawJob, GupyWorkplaceType } from "./gupy.types.js";
import { parseJobPostingSalary } from "../../shared/utils/parse-job-posting-salary.js";

type JobPostingJsonLd = {
  "@type"?: string;
  title?: string;
  description?: string;
  datePosted?: string;
  validThrough?: string;
  hiringOrganization?: { name?: string };
  jobLocation?: {
    address?: { streetAddress?: string; addressCountry?: string };
    additionalProperty?: { value?: string };
  };
  baseSalary?: unknown;
};

const decodeHtmlEntities = (value: string): string =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'");

export const stripHtmlTags = (html: string): string =>
  decodeHtmlEntities(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

const mapWorkplaceType = (value?: string): GupyWorkplaceType | undefined => {
  if (!value) return undefined;
  const normalized = value.toUpperCase();
  if (normalized.includes("TELECOMMUTE") || normalized.includes("REMOTE")) return "remote";
  if (normalized.includes("HYBRID")) return "hybrid";
  return undefined;
};

export const extractJobPostingJsonLd = (html: string): JobPostingJsonLd | null => {
  const match = html.match(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i,
  );
  if (!match?.[1]) return null;

  try {
    const parsed = JSON.parse(decodeHtmlEntities(match[1].trim())) as JobPostingJsonLd;
    return parsed["@type"] === "JobPosting" ? parsed : null;
  } catch {
    return null;
  }
};

export const isGupyApplicationsClosed = (html: string, validThrough?: string): boolean => {
  if (/Candidaturas encerradas/i.test(html)) return true;
  if (validThrough) {
    const expires = new Date(validThrough);
    if (!Number.isNaN(expires.getTime()) && expires.getTime() < Date.now()) return true;
  }
  return false;
};

export const mapJobPostingToGupyRaw = (
  posting: JobPostingJsonLd,
  sourceUrl: string,
): GupyRawJob | null => {
  const title = posting.title?.trim();
  const company = posting.hiringOrganization?.name?.trim();
  if (!title || !company) return null;

  const street = posting.jobLocation?.address?.streetAddress?.trim();
  const country = posting.jobLocation?.address?.addressCountry?.trim();
  const location = [street, country].filter(Boolean).join(", ") || undefined;
  const salary = parseJobPostingSalary(posting.baseSalary);

  return {
    jobUrl: sourceUrl,
    name: title,
    careerPageName: company,
    city: street ?? undefined,
    state: country ?? undefined,
    workplaceType: mapWorkplaceType(posting.jobLocation?.additionalProperty?.value),
    publishedDate: posting.datePosted,
    salaryMin: salary?.salaryMin,
    salaryMax: salary?.salaryMax,
  };
};

export const parseGupyJobFromPageHtml = (
  html: string,
  sourceUrl: string,
): { raw: GupyRawJob; warnings: string[]; description: string } | null => {
  const posting = extractJobPostingJsonLd(html);
  if (!posting) return null;

  const raw = mapJobPostingToGupyRaw(posting, sourceUrl);
  if (!raw) return null;

  const description = stripHtmlTags(posting.description ?? `${raw.name} na ${raw.careerPageName}`);
  const warnings: string[] = [];

  if (isGupyApplicationsClosed(html, posting.validThrough)) {
    warnings.push(
      "Candidaturas encerradas na Gupy. Você ainda pode importar e acompanhar no pipeline.",
    );
  }

  return { raw, warnings, description };
};

export const GUPY_PAGE_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml",
  "Accept-Language": "pt-BR,pt;q=0.9",
} as const;
