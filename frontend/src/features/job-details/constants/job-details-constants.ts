export const JOB_DETAILS_LAYOUT = {
  page: "space-y-6 pb-28 lg:pb-6",
  grid: "grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]",
  main: "space-y-4 min-w-0",
  sidebar: "hidden lg:block lg:sticky lg:top-6 lg:self-start space-y-4",
  mobileStack: "space-y-4 lg:hidden",
  bottomBar:
    "fixed bottom-0 inset-x-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur pb-safe p-4 lg:hidden",
} as const;

export const EMPLOYMENT_TYPE_LABELS = {
  clt: "CLT",
  pj: "PJ",
  contract: "Contrato",
  internship: "Estágio",
} as const;

export const LEARNING_GAP_IMPORTANCE_LABELS = {
  high: "Alta",
  medium: "Média",
  low: "Baixa",
} as const;

export const SENIORITY_LABELS: Record<string, string> = {
  intern: "Estágio",
  junior: "Júnior",
  mid: "Pleno",
  senior: "Sênior",
  lead: "Lead",
  staff: "Staff",
};

export const MODALITY_LABELS: Record<string, string> = {
  remote: "Remoto",
  hybrid: "Híbrido",
  onsite: "Presencial",
};
