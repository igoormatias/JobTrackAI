import type { GupyRawJob, GupyWorkplaceType } from "./gupy.types.js";
import { parseJobPostingSalary } from "../../shared/utils/parse-job-posting-salary.js";
import {
  extractSectionsFromHtml,
  htmlToPlainText,
  sanitizeJobHtml,
} from "../../shared/utils/job-html.utils.js";
import { inferTechnologiesFromText } from "../../shared/utils/job-search-fields.js";

type JobPostingJsonLd = {
  "@type"?: string;
  title?: string;
  description?: string;
  datePosted?: string;
  validThrough?: string;
  hiringOrganization?: { name?: string };
  jobLocation?: {
    address?: {
      streetAddress?: string;
      addressLocality?: string;
      addressRegion?: string;
      addressCountry?: string;
    };
    additionalProperty?: { value?: string };
  };
  jobLocationType?: string;
  baseSalary?: unknown;
  employmentType?: string | string[];
  experienceRequirements?: string;
  skills?: string | string[];
};

export type GupyParsedJob = {
  raw: GupyRawJob;
  warnings: string[];
  description: string;
  descriptionHtml: string | null;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  technologies: string[];
  seniority: string | null;
  modality: GupyWorkplaceType | undefined;
};

const decodeHtmlEntities = (value: string): string =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'");

/** Preserve structure when converting HTML description to text (legacy helper). */
export const stripHtmlTags = (html: string): string =>
  decodeHtmlEntities(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
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
  if (normalized.includes("ON_SITE") || normalized.includes("ONSITE") || normalized.includes("ON-SITE")) {
    return "on-site";
  }
  return undefined;
};

const mapSeniority = (text?: string | null): string | null => {
  if (!text) return null;
  const lower = text.toLowerCase();
  if (/\bstaff\b/.test(lower)) return "staff";
  if (/\blead\b|l[ií]der|tech lead/.test(lower)) return "lead";
  if (/especialista|specialist/.test(lower)) return "specialist";
  if (/s[eê]nior|senior/.test(lower)) return "senior";
  if (/pleno|mid[\s-]?level/.test(lower)) return "mid";
  if (/j[uú]nior|junior|jr\b/.test(lower)) return "junior";
  if (/est[aá]gio|intern|trainee/.test(lower)) return "intern";
  return null;
};

export const extractJobPostingJsonLd = (html: string): JobPostingJsonLd | null => {
  const matches = html.matchAll(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );

  for (const match of matches) {
    if (!match[1]) continue;
    try {
      const parsed = JSON.parse(decodeHtmlEntities(match[1].trim())) as
        | JobPostingJsonLd
        | JobPostingJsonLd[];
      const candidates = Array.isArray(parsed) ? parsed : [parsed];
      const posting = candidates.find((item) => item["@type"] === "JobPosting");
      if (posting) return posting;
    } catch {
      // try next script block
    }
  }

  return null;
};

export const isGupyApplicationsClosed = (html: string, validThrough?: string): boolean => {
  if (/Candidaturas encerradas/i.test(html)) return true;
  if (validThrough) {
    const expires = new Date(validThrough);
    if (!Number.isNaN(expires.getTime()) && expires.getTime() < Date.now()) return true;
  }
  return false;
};

const extractSkills = (posting: JobPostingJsonLd, descriptionText: string): string[] => {
  const fromLd: string[] = [];
  if (typeof posting.skills === "string") {
    fromLd.push(...posting.skills.split(/[,;/|]/).map((s) => s.trim()).filter(Boolean));
  } else if (Array.isArray(posting.skills)) {
    fromLd.push(...posting.skills.map(String).map((s) => s.trim()).filter(Boolean));
  }
  const inferred = inferTechnologiesFromText(`${posting.title ?? ""} ${descriptionText}`);
  return [...new Set([...fromLd, ...inferred])];
};

const resolveLocation = (posting: JobPostingJsonLd): { city?: string; state?: string; country?: string; location?: string } => {
  const address = posting.jobLocation?.address;
  const city = address?.addressLocality?.trim() || address?.streetAddress?.trim();
  const state = address?.addressRegion?.trim();
  const country = address?.addressCountry?.trim();
  const location = [city, state, country].filter(Boolean).join(", ") || undefined;
  return { city, state, country, location };
};

export const mapJobPostingToGupyRaw = (
  posting: JobPostingJsonLd,
  sourceUrl: string,
): GupyRawJob | null => {
  const title = posting.title?.trim();
  const company = posting.hiringOrganization?.name?.trim();
  if (!title || !company) return null;

  const { city, state, country } = resolveLocation(posting);
  const salary = parseJobPostingSalary(posting.baseSalary);
  const modality =
    mapWorkplaceType(posting.jobLocationType) ??
    mapWorkplaceType(posting.jobLocation?.additionalProperty?.value);

  return {
    jobUrl: sourceUrl,
    name: title,
    careerPageName: company,
    city: city ?? undefined,
    state: state ?? country ?? undefined,
    country: country ?? undefined,
    workplaceType: modality,
    publishedDate: posting.datePosted,
    salaryMin: salary?.salaryMin,
    salaryMax: salary?.salaryMax,
  };
};

export const parseGupyJobFromPageHtml = (
  html: string,
  sourceUrl: string,
): GupyParsedJob | null => {
  const posting = extractJobPostingJsonLd(html);
  if (!posting) return null;

  const raw = mapJobPostingToGupyRaw(posting, sourceUrl);
  if (!raw) return null;

  const rawDescriptionHtml = posting.description ?? "";
  const sections = extractSectionsFromHtml(rawDescriptionHtml || `<p>${raw.name} na ${raw.careerPageName}</p>`);
  const description =
    sections.descriptionText ||
    stripHtmlTags(rawDescriptionHtml) ||
    `${raw.name} na ${raw.careerPageName}`;
  const descriptionHtml =
    sanitizeJobHtml(rawDescriptionHtml) ??
    sanitizeJobHtml(`<p>${description.replace(/\n/g, "<br/>")}</p>`);

  const technologies = extractSkills(posting, `${raw.name} ${description}`);
  const seniority =
    mapSeniority(raw.name) ??
    mapSeniority(posting.experienceRequirements) ??
    mapSeniority(description);

  const modality =
    mapWorkplaceType(posting.jobLocationType) ??
    mapWorkplaceType(posting.jobLocation?.additionalProperty?.value) ??
    ( /remoto|remote|home office/i.test(description) ? "remote" : undefined);

  const warnings: string[] = [];
  if (isGupyApplicationsClosed(html, posting.validThrough)) {
    warnings.push(
      "Candidaturas encerradas na Gupy. Você ainda pode importar e acompanhar no pipeline.",
    );
  }

  return {
    raw: {
      ...raw,
      description,
      skills: technologies,
      workplaceType: modality ?? raw.workplaceType,
    },
    warnings,
    description,
    descriptionHtml,
    requirements: sections.requirements,
    responsibilities: sections.responsibilities,
    benefits: sections.benefits,
    technologies,
    seniority,
    modality: modality ?? raw.workplaceType,
  };
};

export const GUPY_PAGE_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml",
  "Accept-Language": "pt-BR,pt;q=0.9",
} as const;

// Re-export for callers that only need plain text
export { htmlToPlainText };
