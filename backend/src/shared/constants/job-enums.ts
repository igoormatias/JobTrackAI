export const WORKPLACE_TYPE_LABELS = {
  "on-site": "Presencial",
  hybrid: "Híbrido",
  remote: "Remoto",
} as const;

export const EMPLOYMENT_TYPE_LABELS = {
  vacancy_type_effective: "Efetivo",
  vacancy_type_apprentice: "Jovem Aprendiz",
  vacancy_type_internship: "Estágio",
  vacancy_type_temporary: "Temporário",
  vacancy_type_freelancer: "Freelancer",
} as const;

export type WorkplaceType = keyof typeof WORKPLACE_TYPE_LABELS;
export type EmploymentType = keyof typeof EMPLOYMENT_TYPE_LABELS;
