import type { Seniority, WorkModality } from "@/types";

export const SENIORITY_OPTIONS: { value: Seniority; label: string }[] = [
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Pleno" },
  { value: "senior", label: "Senior" },
  { value: "specialist", label: "Especialista" },
  { value: "lead", label: "Tech Lead" },
];

export const MODALITY_OPTIONS: { value: WorkModality; label: string }[] = [
  { value: "remote", label: "Remoto" },
  { value: "hybrid", label: "Híbrido" },
  { value: "onsite", label: "Presencial" },
  { value: "any", label: "Aceita qualquer modalidade" },
];

export const LOCATION_SCOPE_OPTIONS = [
  { value: "country" as const, label: "Brasil inteiro" },
  { value: "state" as const, label: "Estado" },
  { value: "city" as const, label: "Cidade" },
];
