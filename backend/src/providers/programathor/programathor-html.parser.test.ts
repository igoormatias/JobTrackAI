import { describe, expect, it } from "vitest";

import {
  extractProgramathorExternalId,
  parseProgramathorJobViewHtml,
  parseProgramathorSearchHtml,
} from "./programathor-html.parser.js";

const SAMPLE_LISTING_HTML = `
<div class="cell-list ">
  <a href="/jobs/33645-scrum-master">
    <div class="row">
      <div class="col-sm-9">
        <div class="cell-list-content">
          <h3 class="text-24 line-height-30">Scrum Master</h3>
          <div class="cell-list-content-icon">
            <span><i class="fa fa-briefcase"></i>Grupo Virtus</span>
            <span><i class="fas fa-map-marker-alt"></i>São Paulo (Híbrido)</span>
            <span><i class="fa fa-building"></i>Pequena/média empresa</span>
            <span><i class="far fa-chart-bar"></i>Sênior</span>
            <span><i class="far fa-file-alt"></i>PJ</span>
          </div>
          <div>
            <span class="tag-list background-gray">Azure</span>
            <span class="tag-list background-gray">Kanban</span>
            <span class="tag-list background-gray">SCRUM</span>
          </div>
        </div>
      </div>
    </div>
  </a>
</div>
<div class="cell-list ">
  <a href="/jobs/33640-senior-react-native-developer">
    <div class="row">
      <div class="col-sm-9">
        <div class="cell-list-content">
          <h3 class="text-24 line-height-30">Senior React Native Developer</h3>
          <div class="cell-list-content-icon">
            <span><i class="fa fa-briefcase"></i>lemon.io</span>
            <span><i class="fas fa-map-marker-alt"></i>Remoto</span>
            <span><i class="far fa-chart-bar"></i>Sênior</span>
            <span><i class="far fa-money-bill-alt"></i>Até R$15.000</span>
          </div>
          <div>
            <span class="tag-list background-gray">React Native</span>
            <span class="tag-list background-gray">Node.js</span>
          </div>
        </div>
      </div>
    </div>
  </a>
</div>
`;

const SAMPLE_JOB_VIEW_HTML = `
<html>
<head>
  <script type="application/ld+json">
  {
    "@context": "http://schema.org/",
    "@type": "JobPosting",
    "title": "Senior React Native Developer",
    "description": "<p>Build mobile apps with <strong>React Native</strong>.</p>",
    "datePosted": "2026-06-30",
    "jobLocationType": "TELECOMMUTE",
    "hiringOrganization": {
      "@type": "Organization",
      "name": "lemon.io"
    }
  }
  </script>
</head>
<body>
  <h1>Senior React Native Developer</h1>
  <h2 class="font-bold-600 text-30"><a href="/companies/123">lemon.io</a></h2>
  <span class="tag color-white tag-hover">React Native</span>
</body>
</html>
`;

describe("parseProgramathorSearchHtml", () => {
  it("extracts listing cards with absolute URLs and metadata", () => {
    const jobs = parseProgramathorSearchHtml(SAMPLE_LISTING_HTML);

    expect(jobs).toHaveLength(2);
    expect(jobs[0]).toMatchObject({
      title: "Scrum Master",
      company: "Grupo Virtus",
      location: "São Paulo (Híbrido)",
      modality: "hybrid",
      seniority: "senior",
      externalId: "33645",
      url: "https://programathor.com.br/jobs/33645-scrum-master",
      tags: ["Azure", "Kanban", "SCRUM"],
    });
    expect(jobs[1]).toMatchObject({
      title: "Senior React Native Developer",
      company: "lemon.io",
      location: "Remoto",
      modality: "remote",
      salaryMax: 15000,
      externalId: "33640",
    });
  });
});

describe("extractProgramathorExternalId", () => {
  it("reads numeric id from job slug URL", () => {
    expect(extractProgramathorExternalId("https://programathor.com.br/jobs/33645-scrum-master")).toBe(
      "33645",
    );
  });
});

describe("parseProgramathorJobViewHtml", () => {
  it("parses job detail page from JSON-LD", () => {
    const url = "https://programathor.com.br/jobs/33640-senior-react-native-developer";
    const job = parseProgramathorJobViewHtml(SAMPLE_JOB_VIEW_HTML, url);

    expect(job).not.toBeNull();
    expect(job).toMatchObject({
      title: "Senior React Native Developer",
      company: "lemon.io",
      modality: "remote",
      externalId: "33640",
      publishedAt: "2026-06-30",
      description: "Build mobile apps with React Native.",
      tags: ["React Native"],
    });
  });
});
