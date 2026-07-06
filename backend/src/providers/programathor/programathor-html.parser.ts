import { load } from "cheerio";

import { parseJobPostingSalary } from "../../shared/utils/parse-job-posting-salary.js";
import { PROGRAMATHOR_BASE_URL } from "./programathor.constants.js";
import type { ProgramathorRawJob } from "./programathor.types.js";

const stripHtml = (html: string): string =>
  load(`<div>${html}</div>`)
    .text()
    .replace(/\s+/g, " ")
    .trim();

const toAbsoluteUrl = (href: string): string => {
  const trimmed = href.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `${PROGRAMATHOR_BASE_URL}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
};

export const extractProgramathorExternalId = (url: string): string | null => {
  const match = url.match(/\/jobs\/(\d+)(?:-|$)/i);
  return match?.[1] ?? null;
};

const parseSalaryFromText = (text: string): { salaryMin?: number; salaryMax?: number } => {
  const match = text.match(/at[eé]\s*r\$\s*([\d.,]+)/i);
  if (!match?.[1]) return {};

  const amount = Number(match[1].replace(/\./g, "").replace(",", "."));
  if (!Number.isFinite(amount) || amount <= 0) return {};

  return { salaryMax: Math.round(amount) };
};

const mapModalityFromLocation = (location?: string): string | null => {
  if (!location) return null;
  const lower = location.toLowerCase();
  if (lower.includes("remoto")) return "remote";
  if (lower.includes("híbrido") || lower.includes("hibrido")) return "hybrid";
  return null;
};

const mapSeniorityFromText = (text?: string): string | null => {
  if (!text) return null;
  const lower = text.toLowerCase();
  if (lower.includes("sênior") || lower.includes("senior")) return "senior";
  if (lower.includes("pleno")) return "mid";
  if (lower.includes("júnior") || lower.includes("junior")) return "junior";
  return null;
};

const extractIconSpanText = (
  $: ReturnType<typeof load>,
  card: ReturnType<ReturnType<typeof load>>,
  iconClass: string,
): string | undefined => {
  let found: string | undefined;
  card.find(".cell-list-content-icon span").each((_, element) => {
    const span = $(element);
    const icon = span.find("i").first();
    if (!icon.hasClass(iconClass) && !icon.attr("class")?.includes(iconClass)) return;
    const clone = span.clone();
    clone.find("i").remove();
    const text = clone.text().trim();
    if (text) found = text;
  });
  return found;
};

export const parseProgramathorSearchHtml = (html: string): ProgramathorRawJob[] => {
  const $ = load(html);
  const jobs: ProgramathorRawJob[] = [];

  $("div.cell-list").each((_, element) => {
    const card = $(element);
    const linkEl = card.find("a[href*='/jobs/']").first();
    const href = linkEl.attr("href")?.trim() ?? "";
    const url = toAbsoluteUrl(href);
    if (!url) return;

    const externalId = extractProgramathorExternalId(url);
    if (!externalId) return;

    const title = card.find("h3").first().text().trim() || "Título indisponível";
    const company =
      extractIconSpanText($, card, "fa-briefcase") ||
      card.find(".cell-list-content-icon span").first().text().trim() ||
      "Empresa não informada";
    const location = extractIconSpanText($, card, "fa-map-marker-alt");
    const seniorityText = extractIconSpanText($, card, "fa-chart-bar");
    const tags = card
      .find("span.tag-list")
      .map((__, tag) => $(tag).text().trim())
      .get()
      .filter(Boolean);

    const cardText = card.text();
    const salary = parseSalaryFromText(cardText);

    jobs.push({
      title,
      company,
      url,
      location,
      tags,
      seniority: mapSeniorityFromText(seniorityText),
      modality: mapModalityFromLocation(location),
      salaryMin: salary.salaryMin ?? null,
      salaryMax: salary.salaryMax ?? null,
      externalId,
    });
  });

  return jobs;
};

type JobPostingLd = {
  "@type"?: string;
  title?: string;
  description?: string;
  datePosted?: string;
  baseSalary?: unknown;
  hiringOrganization?: { name?: string };
  jobLocationType?: string;
  jobLocation?: {
    address?: {
      addressLocality?: string;
      addressRegion?: string;
    };
  };
};

const extractJobPostingJsonLd = (html: string): JobPostingLd | null => {
  const match = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
  if (!match?.[1]) return null;

  try {
    const parsed = JSON.parse(match[1].trim()) as JobPostingLd;
    return parsed["@type"] === "JobPosting" ? parsed : null;
  } catch {
    return null;
  }
};

const resolveLocationFromLd = (ld: JobPostingLd): string | undefined => {
  if (ld.jobLocationType === "TELECOMMUTE") return "Remoto";

  const locality = ld.jobLocation?.address?.addressLocality?.trim();
  const region = ld.jobLocation?.address?.addressRegion?.trim();
  const parts = [locality, region].filter((part) => part && part !== "-");
  return parts.length > 0 ? parts.join(", ") : undefined;
};

export const parseProgramathorJobViewHtml = (html: string, sourceUrl: string): ProgramathorRawJob | null => {
  const externalId = extractProgramathorExternalId(sourceUrl);
  if (!externalId) return null;

  const ld = extractJobPostingJsonLd(html);
  const $ = load(html);

  const title =
    ld?.title?.trim() ||
    $("h1").first().text().trim() ||
    $('meta[property="og:title"]').attr("content")?.trim() ||
    "";
  const company =
    ld?.hiringOrganization?.name?.trim() ||
    $("h2.font-bold-600 a").first().text().trim() ||
    $("h2.font-bold-600").first().text().trim() ||
    "";

  if (!title) return null;

  const location = resolveLocationFromLd(ld ?? {}) || undefined;
  const description = ld?.description ? stripHtml(ld.description).slice(0, 4000) : undefined;
  const salaryFromLd = ld?.baseSalary ? parseJobPostingSalary(ld.baseSalary) : null;
  const tags = $("span.tag.color-white.tag-hover, span.tag-list")
    .map((_, tag) => $(tag).text().trim())
    .get()
    .filter(Boolean);

  const modality =
    ld?.jobLocationType === "TELECOMMUTE"
      ? "remote"
      : mapModalityFromLocation(location ?? $("a[href='/jobs-city/remoto']").parent().text());

  return {
    title,
    company: company || "Empresa não informada",
    url: sourceUrl,
    location,
    tags: [...new Set(tags)],
    seniority: null,
    modality,
    salaryMin: salaryFromLd?.salaryMin ?? null,
    salaryMax: salaryFromLd?.salaryMax ?? null,
    description,
    publishedAt: ld?.datePosted,
    externalId,
  };
};
