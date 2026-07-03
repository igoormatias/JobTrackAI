import { describe, expect, it } from "vitest";

import {
  extractJobPostingJsonLd,
  isGupyApplicationsClosed,
  mapJobPostingToGupyRaw,
  parseGupyJobFromPageHtml,
  stripHtmlTags,
} from "./gupy-page.parser.js";

const MEMED_SNIPPET = `<script type="application/ld+json">{"@context":"http://schema.org","@type":"JobPosting","datePosted":"2026-03-10","description":"&lt;p&gt;A Memed é healthtech.&lt;/p&gt;","hiringOrganization":{"@type":"Organization","name":"Memed"},"jobLocation":{"@type":"Place","address":{"@type":"PostalAddress","streetAddress":"Brasil","addressCountry":"Brasil"},"additionalProperty":{"@type":"PropertyValue","value":"TELECOMMUTE"}},"title":"Frontend Engineer Sênior – React","validThrough":"2026-07-27"}</script>`;

describe("gupy-page.parser", () => {
  it("extracts JobPosting JSON-Ld", () => {
    const posting = extractJobPostingJsonLd(MEMED_SNIPPET);
    expect(posting?.title).toBe("Frontend Engineer Sênior – React");
    expect(posting?.hiringOrganization?.name).toBe("Memed");
  });

  it("maps posting to GupyRawJob", () => {
    const posting = extractJobPostingJsonLd(MEMED_SNIPPET)!;
    const raw = mapJobPostingToGupyRaw(posting, "https://memed.gupy.io/jobs/10970184");
    expect(raw?.name).toBe("Frontend Engineer Sênior – React");
    expect(raw?.careerPageName).toBe("Memed");
    expect(raw?.workplaceType).toBe("remote");
  });

  it("detects closed applications banner", () => {
    expect(isGupyApplicationsClosed("Candidaturas encerradas", undefined)).toBe(true);
  });

  it("parses full page html with warnings", () => {
    const html = `${MEMED_SNIPPET}<div>Candidaturas encerradas</div>`;
    const parsed = parseGupyJobFromPageHtml(html, "https://memed.gupy.io/jobs/10970184");
    expect(parsed?.raw.name).toContain("Frontend Engineer");
    expect(parsed?.warnings.length).toBe(1);
    expect(stripHtmlTags("&lt;p&gt;Hello&lt;/p&gt;")).toContain("Hello");
  });
});
