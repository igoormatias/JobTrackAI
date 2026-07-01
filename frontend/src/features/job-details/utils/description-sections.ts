import type { Job } from "@/types";

import type { JobDescriptionSections } from "../types/job-details.types";

export const buildDescriptionSections = (job: Job): JobDescriptionSections => {
  const sentences = job.description.split(/(?<=[.!?])\s+/).filter(Boolean);
  const midpoint = Math.ceil(job.requirements.length / 2);

  return {
    summary: sentences.slice(0, 2).join(" ") || job.description.slice(0, 180),
    fullDescription: job.description,
    requirements: job.requirements.slice(0, midpoint),
    desirable: job.requirements.slice(midpoint),
    benefits: job.benefits,
    additionalInfo: job.benefits.length > 0 ? "Vaga com benefícios competitivos e cultura de feedback contínuo." : null,
  };
};
