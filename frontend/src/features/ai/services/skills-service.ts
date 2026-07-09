import { apiClient } from "@/lib/api-client";

export type SkillCatalogItem = {
  id: string;
  name: string;
  slug: string;
};

export type NormalizedSkill = {
  input: string;
  name: string;
  slug: string;
};

export const searchSkillsCatalog = async (query = "", limit = 20): Promise<SkillCatalogItem[]> => {
  const response = await apiClient.get<{ data: SkillCatalogItem[] }>("/ai/skills/catalog", {
    params: { q: query, limit },
  });
  return response.data.data;
};

export const normalizeSkills = async (skills: string[]): Promise<NormalizedSkill[]> => {
  const response = await apiClient.post<{ data: { skills: NormalizedSkill[] } }>("/ai/skills/normalize", {
    skills,
  });
  return response.data.data.skills;
};
