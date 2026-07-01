import type { PipelineStage } from "@/types";

export type PipelineColumnVariant = "default" | "success" | "danger";

export type PipelineColumnConfig = {
  stage: PipelineStage;
  label: string;
  icon: string;
  order: number;
  variant: PipelineColumnVariant;
};

export const PIPELINE_COLUMN_CONFIG: readonly PipelineColumnConfig[] = [
  { stage: "favorite", label: "Favoritas", icon: "Star", order: 0, variant: "default" },
  { stage: "applied", label: "Aplicadas", icon: "Send", order: 1, variant: "default" },
  { stage: "hr", label: "Triagem RH", icon: "Phone", order: 2, variant: "default" },
  { stage: "technical_interview", label: "Entrevista Técnica", icon: "Laptop", order: 3, variant: "default" },
  { stage: "manager", label: "Entrevista Gestor", icon: "UserRound", order: 4, variant: "default" },
  { stage: "client", label: "Entrevista Cliente", icon: "Handshake", order: 5, variant: "default" },
  { stage: "offer", label: "Oferta", icon: "DollarSign", order: 6, variant: "default" },
  { stage: "hired", label: "Contratada", icon: "PartyPopper", order: 7, variant: "success" },
  { stage: "rejected", label: "Rejeitada", icon: "XCircle", order: 8, variant: "danger" },
] as const;

export const PIPELINE_STAGE_ORDER = PIPELINE_COLUMN_CONFIG.map((column) => column.stage);

export const PIPELINE_STAGE_LABELS = Object.fromEntries(
  PIPELINE_COLUMN_CONFIG.map((column) => [column.stage, column.label]),
) as Record<PipelineStage, string>;
