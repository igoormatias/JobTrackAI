import { describe, expect, it } from "vitest";

import { sanitizeJobDescriptionHtml } from "./sanitize-html";

describe("sanitizeJobDescriptionHtml", () => {
  it("strips scripts and event handlers", () => {
    const dirty =
      '<p>Olá</p><script>alert(1)</script><img src=x onerror="alert(1)"/><a href="javascript:alert(1)">x</a>';
    const clean = sanitizeJobDescriptionHtml(dirty);
    expect(clean).not.toContain("script");
    expect(clean).not.toContain("onerror");
    expect(clean).not.toContain("javascript:");
  });

  it("keeps structural tags", () => {
    const html = "<p>Resumo</p><ul><li>React</li><li>Node</li></ul><br/>";
    const clean = sanitizeJobDescriptionHtml(html);
    expect(clean).toContain("<p>");
    expect(clean).toContain("<ul>");
    expect(clean).toContain("<li>");
  });
});
