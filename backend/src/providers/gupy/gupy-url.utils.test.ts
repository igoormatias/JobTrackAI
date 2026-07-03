import { describe, expect, it } from "vitest";

import { isGupyJobUrl, parseGupyJobUrl } from "./gupy-url.utils.js";

describe("parseGupyJobUrl", () => {
  it("parses portal.gupy.io/job/{id}", () => {
    const result = parseGupyJobUrl("https://portal.gupy.io/job/12345");
    expect(result).toEqual({
      jobId: "12345",
      sourceUrl: "https://portal.gupy.io/job/12345",
    });
  });

  it("parses {company}.gupy.io/jobs/{id}", () => {
    const result = parseGupyJobUrl("https://afya.gupy.io/jobs/11299164");
    expect(result).toEqual({
      jobId: "11299164",
      sourceUrl: "https://afya.gupy.io/jobs/11299164",
    });
  });

  it("preserves original career page url", () => {
    const url = "https://afya.gupy.io/jobs/11299164?utm_source=share";
    const result = parseGupyJobUrl(url);
    expect(result?.jobId).toBe("11299164");
    expect(result?.sourceUrl).toBe("https://afya.gupy.io/jobs/11299164?utm_source=share");
  });

  it("rejects non-gupy urls", () => {
    expect(parseGupyJobUrl("https://example.com/jobs/1")).toBeNull();
    expect(isGupyJobUrl("https://linkedin.com/jobs/1")).toBe(false);
  });
});
