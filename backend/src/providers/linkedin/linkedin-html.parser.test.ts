import { describe, expect, it } from "vitest";

import { parseLinkedinSearchHtml } from "./linkedin-html.parser.js";

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
