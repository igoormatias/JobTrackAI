import { describe, expect, it } from "vitest";

import { SkillMatcher } from "./skill-matcher.service.js";

describe("SkillMatcher", () => {
  const matcher = new SkillMatcher();

  it("canonicalizes ReactJS to react", () => {
    expect(matcher.canonicalize("ReactJS")).toBe("react");
  });

  it("canonicalizes NodeJS to node-js", () => {
    expect(matcher.canonicalize("NodeJS")).toBe("node-js");
  });

  it("canonicalizes TS to typescript", () => {
    expect(matcher.canonicalize("TS")).toBe("typescript");
  });

  it("matches React with ReactJS job term", () => {
    expect(matcher.matches("React", "ReactJS")).toBe(true);
  });

  it("finds matches across alias variants", () => {
    const matched = matcher.findMatches(["TypeScript", "React"], ["TS", "ReactJS", "Docker"]);
    expect(matched).toContain("TypeScript");
    expect(matched).toContain("React");
    expect(matched).not.toContain("Docker");
  });
});
