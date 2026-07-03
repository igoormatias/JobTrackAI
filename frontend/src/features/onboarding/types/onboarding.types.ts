import type {
  OnboardingStepId,
  ProfessionalArea,
  ProfileLocation,
  SalaryBand,
  Seniority,
  WorkModality,
} from "@/types";

export type OnboardingStep = OnboardingStepId;

export const ONBOARDING_STEPS: OnboardingStep[] = [
  "area",
  "skills",
  "seniority",
  "modality",
  "location",
  "salary",
  "summary",
];

export type OnboardingFormState = {
  area: ProfessionalArea | "";
  skills: string[];
  seniority: Seniority | "";
  modality: WorkModality | "";
  locationPreference: ProfileLocation;
  salaryBand: SalaryBand | "";
};

export const createInitialFormState = (): OnboardingFormState => ({
  area: "",
  skills: [],
  seniority: "",
  modality: "",
  locationPreference: {
    scope: "country",
    acceptsRelocation: false,
  },
  salaryBand: "",
});

export const STEP_TITLES: Record<OnboardingStep, string> = {
  area: "Qual sua área profissional?",
  skills: "Quais são suas competências principais?",
  seniority: "Qual sua senioridade?",
  modality: "Qual modelo de trabalho prefere?",
  location: "Onde você deseja trabalhar?",
  salary: "Qual sua pretensão salarial?",
  summary: "Revise seu perfil profissional",
};

export const STEP_HELP: Record<OnboardingStep, string> = {
  area: "Selecione apenas uma área. Isso personaliza as opções dos próximos passos.",
  skills: "Escolha as competências que você domina. Você pode pesquisar na lista.",
  seniority: "Informe seu nível de experiência na área selecionada.",
  modality: "Escolha a modalidade de trabalho que você prefere ou aceita.",
  location: "Defina onde você busca oportunidades e se aceita mudança.",
  salary: "Selecione a faixa salarial que representa sua pretensão.",
  summary: "Confira todas as informações antes de finalizar seu perfil.",
};
