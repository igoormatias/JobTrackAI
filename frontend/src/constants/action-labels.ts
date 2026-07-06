import type { JobSource } from "@/types";

const SOURCE_LABELS: Record<JobSource, string> = {
  gupy: "Gupy",
  linkedin: "LinkedIn",
  programathor: "Programathor",
  manual: "Manual",
  referral: "Indicação",
  recruiter: "Recrutador",
  company_site: "Site da empresa",
  other: "Outro",
};

export const ACTION_LABELS = {
  viewJobDescription: "Ver descrição",
  openOriginalJob: "Abrir vaga original",
  startProcess: "Iniciar processo",
  editProcess: "Editar processo",
  updateStage: "Atualizar etapa",
  scheduleInterview: "Agendar entrevista",
  viewCalendar: "Ver calendário",
  viewCompany: "Ver empresa",
  openProcess: "Abrir processo",
  deleteProcess: "Excluir processo",
  addToPipeline: "Adicionar ao Pipeline",
  changeFavorite: "Favoritar",
  viewDetails: "Ver detalhes",
} as const;

export const openOriginalJobLabel = (source?: JobSource | string | null): string => {
  if (!source || !(source in SOURCE_LABELS)) {
    return ACTION_LABELS.openOriginalJob;
  }
  return `${ACTION_LABELS.openOriginalJob} (${SOURCE_LABELS[source as JobSource]})`;
};
