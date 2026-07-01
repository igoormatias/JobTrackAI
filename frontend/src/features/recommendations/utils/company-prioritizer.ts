import type { Company } from "@/types/company";
import type { ProfessionalArea } from "@/types/profile";

import { getPriorityCompaniesForArea } from "../constants/companies-by-area";

export const prioritizeCompaniesByArea = (
  companies: Company[],
  area: ProfessionalArea | null,
): Company[] => {
  const priorities = getPriorityCompaniesForArea(area);
  const prioritySet = new Set(priorities.map((name) => name.toLowerCase()));

  return [...companies].sort((a, b) => {
    const aPriority = prioritySet.has(a.name.toLowerCase()) ? 0 : 1;
    const bPriority = prioritySet.has(b.name.toLowerCase()) ? 0 : 1;

    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    const aIndex = priorities.findIndex((name) => name.toLowerCase() === a.name.toLowerCase());
    const bIndex = priorities.findIndex((name) => name.toLowerCase() === b.name.toLowerCase());

    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }

    return a.name.localeCompare(b.name);
  });
};
