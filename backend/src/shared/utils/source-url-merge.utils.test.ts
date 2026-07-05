import { describe, expect, it } from "vitest";

import {
  isGupyCareerPageUrl,
  isGupyPortalUrl,
  resolveSourceUrlOnSync,
  shouldUpdateSourceUrlOnImport,
} from "./source-url-merge.utils.js";

describe("source-url-merge.utils", () => {
  const portal = "https://portal.gupy.io/job/10115";
  const career = "https://afya.gupy.io/jobs/11299164";

  it("detects portal and career-page Gupy URLs", () => {
    expect(isGupyPortalUrl(portal)).toBe(true);
    expect(isGupyCareerPageUrl(career)).toBe(true);
    expect(isGupyPortalUrl(career)).toBe(false);
    expect(isGupyCareerPageUrl(portal)).toBe(false);
  });

  it("keeps career-page URL when sync sends portal URL", () => {
    expect(resolveSourceUrlOnSync(career, portal)).toBe(career);
  });

  it("upgrades portal to career-page when sync sends career URL", () => {
    expect(resolveSourceUrlOnSync(portal, career)).toBe(career);
  });

  it("uses incoming URL when no existing URL", () => {
    expect(resolveSourceUrlOnSync(null, portal)).toBe(portal);
  });

  it("flags import update when pasted URL differs", () => {
    expect(shouldUpdateSourceUrlOnImport(portal, career)).toBe(true);
    expect(shouldUpdateSourceUrlOnImport(portal, portal)).toBe(false);
  });
});
