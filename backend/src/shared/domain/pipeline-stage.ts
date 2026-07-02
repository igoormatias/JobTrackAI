export const PIPELINE_STAGES = [
  "discovery",
  "applied",
  "hr",
  "technical_interview",
  "manager",
  "client",
  "technical_test",
  "offer",
  "hired",
  "closed",
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export type PipelineStageVariant = "default" | "success" | "danger";

export type PipelineStageDefinition = {
  slug: PipelineStage;
  label: string;
  order: number;
  variant: PipelineStageVariant;
  isTerminal: boolean;
};

export const PIPELINE_STAGE_DEFINITIONS: readonly PipelineStageDefinition[] = [
  { slug: "discovery", label: "Descoberta", order: 0, variant: "default", isTerminal: false },
  { slug: "applied", label: "Aplicada", order: 1, variant: "default", isTerminal: false },
  { slug: "hr", label: "Triagem RH", order: 2, variant: "default", isTerminal: false },
  { slug: "technical_interview", label: "Entrevista Técnica", order: 3, variant: "default", isTerminal: false },
  { slug: "manager", label: "Entrevista Gestor", order: 4, variant: "default", isTerminal: false },
  { slug: "client", label: "Entrevista Cliente", order: 5, variant: "default", isTerminal: false },
  { slug: "technical_test", label: "Teste Técnico", order: 6, variant: "default", isTerminal: false },
  { slug: "offer", label: "Oferta", order: 7, variant: "default", isTerminal: false },
  { slug: "hired", label: "Contratada", order: 8, variant: "success", isTerminal: true },
  { slug: "closed", label: "Encerrada", order: 9, variant: "danger", isTerminal: true },
] as const;

export const PIPELINE_STAGE_LABELS: Record<PipelineStage, string> = Object.fromEntries(
  PIPELINE_STAGE_DEFINITIONS.map((stage) => [stage.slug, stage.label]),
) as Record<PipelineStage, string>;

export const INTERVIEW_STAGES: PipelineStage[] = [
  "hr",
  "technical_interview",
  "manager",
  "client",
  "technical_test",
];

export const isPipelineStage = (value: string): value is PipelineStage =>
  PIPELINE_STAGES.includes(value as PipelineStage);
