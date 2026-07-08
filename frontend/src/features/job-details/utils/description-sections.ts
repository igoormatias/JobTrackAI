import type { Job } from "@/types";

import type { JobDescriptionSections } from "../types/job-details.types";

const normalizeGluedText = (text: string): string =>
  text
    .replace(/([a-záéíóúãõç])([A-ZÁÉÍÓÚÃÕÇ])/g, "$1\n\n$2")
    .replace(/([.;:])([A-ZÁÉÍÓÚÃÕÇ])/g, "$1\n\n$2")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

export const buildDescriptionSections = (job: Job): JobDescriptionSections => {
  const description = normalizeGluedText(job.description || "");
  const sentences = description.split(/(?<=[.!?])\s+/).filter(Boolean);
  const midpoint = Math.ceil(job.requirements.length / 2);
  const responsibilities = job.responsibilities ?? [];

  return {
    summary: sentences.slice(0, 2).join(" ") || description.slice(0, 180),
    fullDescription: description,
    requirements: job.requirements.slice(0, midpoint || job.requirements.length),
    responsibilities,
    desirable: job.requirements.slice(midpoint),
    benefits: job.benefits,
    additionalInfo: null,
  };
};
