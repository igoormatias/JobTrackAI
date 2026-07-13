import { describe, expect, it } from "vitest";

import { canonicalizeSkill } from "./skill-normalization.js";

describe("skill-normalization", () => {
  it("canonicalizes React aliases to react", () => {
    expect(canonicalizeSkill("ReactJS")).toBe("react");
    expect(canonicalizeSkill("React.js")).toBe("react");
    expect(canonicalizeSkill("react")).toBe("react");
    expect(canonicalizeSkill("React")).toBe("react");
  });

  it("canonicalizes Node and TypeScript aliases", () => {
    expect(canonicalizeSkill("nodejs")).toBe("node-js");
    expect(canonicalizeSkill("Node.js")).toBe("node-js");
    expect(canonicalizeSkill("ts")).toBe("typescript");
    expect(canonicalizeSkill("TypeScript")).toBe("typescript");
  });
});
