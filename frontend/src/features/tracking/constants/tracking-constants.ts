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

export type PipelineStageSlug = (typeof PIPELINE_STAGES)[number];

export const PIPELINE_STAGE_OPTIONS = [
  { value: "discovery", label: "Descoberta" },
  { value: "applied", label: "Aplicada" },
  { value: "hr", label: "Triagem RH" },
  { value: "technical_interview", label: "Entrevista Técnica" },
  { value: "manager", label: "Entrevista Gestor" },
  { value: "client", label: "Entrevista Cliente" },
  { value: "technical_test", label: "Teste Técnico" },
  { value: "offer", label: "Oferta" },
  { value: "hired", label: "Contratada" },
  { value: "closed", label: "Encerrada" },
] as const;

export const JOB_SOURCE_OPTIONS = [
  { value: "manual", label: "Manual" },
  { value: "gupy", label: "Gupy" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "programathor", label: "Programathor" },
  { value: "referral", label: "Indicação" },
  { value: "recruiter", label: "Recrutador" },
  { value: "company_site", label: "Site da Empresa" },
  { value: "other", label: "Outro" },
] as const;

export const PRIORITY_OPTIONS = [
  { value: "HIGH", label: "🔥 Alta" },
  { value: "MEDIUM", label: "⭐ Média" },
  { value: "LOW", label: "⬜ Baixa" },
] as const;
