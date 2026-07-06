import { load } from "cheerio";

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

  if (!title) return null;

  return {
    title,
    company: company || "Empresa não informada",
    location,
    sourceUrl: stripQuery(sourceUrl),
    externalId,
    description,
  };
};
