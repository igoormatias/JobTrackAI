import { describe, expect, it } from "vitest";

import { parsePastedSkills, skillDedupeKey } from "./skills-selector.utils";

describe("skills-selector.utils", () => {
  it("parses comma, semicolon and newline separated skills", () => {
    expect(parsePastedSkills("React, Node\nDocker;TypeScript")).toEqual([
      "React",
      "Node",
      "Docker",
      "TypeScript",
    ]);
  });

  it("dedupes case-insensitive skills", () => {
    expect(skillDedupeKey("React")).toBe(skillDedupeKey("REACT"));
    expect(skillDedupeKey("React JS")).toBe(skillDedupeKey("reactjs"));
  });
});
