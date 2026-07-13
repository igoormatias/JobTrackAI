import { describe, expect, it } from "vitest";

import { JobTitleNormalizer } from "./job-title-normalizer.service.js";

describe("JobTitleNormalizer", () => {
  const normalizer = new JobTitleNormalizer();

  it("infers frontend from React Developer", () => {
    expect(normalizer.inferArea("React Developer")).toBe("frontend");
  });

  it("infers frontend from Portuguese Desenvolvedor React title", () => {
    expect(normalizer.inferArea("Desenvolvedor React - Sênior")).toBe("frontend");
  });

  it("infers frontend from Front-end Engineer", () => {
    expect(normalizer.inferArea("Front-end Engineer")).toBe("frontend");
  });

  it("infers devops from Platform Engineer", () => {
    expect(normalizer.inferArea("Platform Engineer")).toBe("devops");
  });

  it("infers devops from SRE", () => {
    expect(normalizer.inferArea("SRE")).toBe("devops");
  });

  it("infers backend from Node.js Developer", () => {
    expect(normalizer.inferArea("Node.js Developer")).toBe("backend");
  });

  it("prefers frontend over full_stack for Software Engineer Frontend", () => {
    expect(normalizer.inferArea("Software Engineer Frontend")).toBe("frontend");
  });

  it("infers full_stack for generic Software Engineer", () => {
    expect(normalizer.inferArea("Software Engineer")).toBe("full_stack");
  });

  it("returns null for unrecognized titles", () => {
    expect(normalizer.inferArea("Chief Happiness Officer")).toBeNull();
  });
});
