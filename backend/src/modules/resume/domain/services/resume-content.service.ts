import type { ResumeStructuredContent } from "../entities/resume.entity.js";
import { computeResumeContentHash } from "./compute-resume-hash.service.js";

export const applySuggestionToContent = (
  content: ResumeStructuredContent,
  section: string,
  suggestedText: string,
): ResumeStructuredContent => {
  const next = structuredClone(content);

  if (section === "professionalSummary" || section === "summary") {
    next.professionalSummary = suggestedText;
    return next;
  }

  const experienceMatch = section.match(/^experience:(\d+)$/);
  if (experienceMatch) {
    const index = Number(experienceMatch[1]);
    if (next.experiences[index]) {
      next.experiences[index].description = suggestedText;
    }
    return next;
  }

  const projectMatch = section.match(/^project:(\d+)$/);
  if (projectMatch) {
    const index = Number(projectMatch[1]);
    if (next.projects[index]) {
      next.projects[index].description = suggestedText;
    }
    return next;
  }

  if (section === "hardSkills") {
    const skills = suggestedText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    next.hardSkills = [...new Set([...next.hardSkills, ...skills])];
    return next;
  }

  return next;
};

export const buildContentHash = (content: ResumeStructuredContent): string =>
  computeResumeContentHash(content);
