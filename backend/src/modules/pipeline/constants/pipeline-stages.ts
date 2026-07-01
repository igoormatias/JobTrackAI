export const PIPELINE_STAGES = [
  "favorite",
  "applied",
  "hr",
  "technical_interview",
  "manager",
  "client",
  "offer",
  "hired",
  "rejected",
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export const PIPELINE_STAGE_LABELS: Record<PipelineStage, string> = {
  favorite: "Favoritas",
  applied: "Aplicadas",
  hr: "Triagem RH",
  technical_interview: "Entrevista Técnica",
  manager: "Entrevista Gestor",
  client: "Entrevista Cliente",
  offer: "Oferta",
  hired: "Contratada",
  rejected: "Rejeitada",
};

export const INTERVIEW_STAGES: PipelineStage[] = [
  "hr",
  "technical_interview",
  "manager",
  "client",
];
