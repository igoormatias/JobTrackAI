import { describe, expect, it } from "vitest";

import {
  isLinkedinJobSearchResultsPage,
  parseLinkedinJobViewHtml,
  parseLinkedinSearchHtml,
} from "./linkedin-html.parser.js";

const SAMPLE_HTML = `
<div class="base-card">
  <a href="https://www.linkedin.com/jobs/view/1234567890?refId=abc">
    <h3 class="base-search-card__title">Desenvolvedor Front End</h3>
    <h4 class="base-search-card__subtitle">Empresa Teste</h4>
    <span class="job-search-card__location">São Paulo, Brazil</span>
    <time datetime="2026-07-01"></time>
  </a>
</div>
`;

const LINKEDIN_LOGIN_WALL_HTML = `
<html>
<head>
  <meta property="og:title" content="1.000+ Desenvolvedor Javascript vagas em: Brasil" />
  <meta property="og:description" content="As + de 1.000 melhores vagas de Desenvolvedor Javascript" />
</head>
<body>
  <h1>1.000+ Desenvolvedor Javascript vagas em Brasil</h1>
  <p>Entre para ver mais vagas</p>
  <div class="base-card"></div>
  <div class="base-card"></div>
</body>
</html>
`;

const VALID_JOB_VIEW_HTML = `
<html>
<head>
  <script type="application/ld+json">
  {"@type":"JobPosting","title":"Desenvolvedor JavaScript","hiringOrganization":{"name":"Acme Corp"}}
  </script>
  <meta property="og:title" content="Desenvolvedor JavaScript | Acme Corp | LinkedIn" />
</head>
<body>
  <h1 class="top-card-layout__title">Desenvolvedor JavaScript</h1>
  <a class="topcard__org-name-link">Acme Corp</a>
  <span class="topcard__flavor--bullet">São Paulo, SP</span>
  <div class="description__text">Descrição da vaga com requisitos.</div>
</body>
</html>
`;

describe("parseLinkedinSearchHtml", () => {
  it("extracts job cards with canonical URL without query string", () => {
    const jobs = parseLinkedinSearchHtml(SAMPLE_HTML);
    expect(jobs).toHaveLength(1);
    expect(jobs[0]?.title).toBe("Desenvolvedor Front End");
    expect(jobs[0]?.company).toBe("Empresa Teste");
    expect(jobs[0]?.sourceUrl).toBe("https://www.linkedin.com/jobs/view/1234567890");
    expect(jobs[0]?.externalId).toBe("1234567890");
  });
});

describe("parseLinkedinJobViewHtml", () => {
  it("rejects LinkedIn login wall / search results HTML", () => {
    const url = "https://www.linkedin.com/jobs/view/4426866068";
    expect(isLinkedinJobSearchResultsPage(LINKEDIN_LOGIN_WALL_HTML, "1.000+ Desenvolvedor Javascript vagas em: Brasil")).toBe(
      true,
    );
    expect(parseLinkedinJobViewHtml(LINKEDIN_LOGIN_WALL_HTML, url)).toBeNull();
  });

  it("parses a valid job view page", () => {
    const url = "https://www.linkedin.com/jobs/view/4426866068";
    const job = parseLinkedinJobViewHtml(VALID_JOB_VIEW_HTML, url);
    expect(job).not.toBeNull();
    expect(job?.title).toBe("Desenvolvedor JavaScript");
    expect(job?.company).toBe("Acme Corp");
    expect(job?.externalId).toBe("4426866068");
  });
});
