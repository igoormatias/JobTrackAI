import { skillMatcher } from "../../modules/match/domain/services/skill-matcher.service.js";

export type JobSearchDerivedFields = {
  searchText: string;
  technologyText: string;
  technologySlugs: string[];
  requirementsText: string | null;
  benefitsText: string | null;
  descriptionHtml: string | null;
};

export type TechnologyLike = {
  name: string;
  slug?: string;
};

const slugifyTech = (name: string): string => skillMatcher.canonicalize(name);

export const buildJobSearchFields = (input: {
  title: string;
  companyName: string;
  location?: string | null;
  description?: string | null;
  descriptionHtml?: string | null;
  technologies?: TechnologyLike[] | string[];
  requirements?: string[];
  benefits?: string[];
  responsibilities?: string[];
}): JobSearchDerivedFields => {
  const techNames = (input.technologies ?? []).map((tech) =>
    typeof tech === "string" ? tech : tech.name,
  );
  const technologySlugs = [
    ...new Set(techNames.map(slugifyTech).filter(Boolean)),
  ];
  const technologyText = techNames.filter(Boolean).join(" ");
  const requirementsText =
    input.requirements && input.requirements.length > 0
      ? input.requirements.join("\n")
      : null;
  const benefitsText =
    input.benefits && input.benefits.length > 0 ? input.benefits.join("\n") : null;
  const responsibilitiesText =
    input.responsibilities && input.responsibilities.length > 0
      ? input.responsibilities.join("\n")
      : null;

  const searchText = [
    input.title,
    input.companyName,
    input.location,
    technologyText,
    requirementsText,
    benefitsText,
    responsibilitiesText,
    input.description,
  ]
    .filter((part): part is string => Boolean(part && part.trim()))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    searchText,
    technologyText,
    technologySlugs,
    requirementsText,
    benefitsText,
    descriptionHtml: input.descriptionHtml ?? null,
  };
};

/** Infer technology names from free text (title + description) when metadata is empty. */
export const inferTechnologiesFromText = (
  text: string,
  knownSkills: string[] = [],
): string[] => {
  if (!text.trim()) return [];
  const haystack = text.toLowerCase();
  const candidates = knownSkills.length
    ? knownSkills
    : [
        "React",
        "Next.js",
        "TypeScript",
        "JavaScript",
        "Node.js",
        "Vue",
        "Angular",
        "Python",
        "Java",
        "Go",
        "Docker",
        "Kubernetes",
        "AWS",
        "GraphQL",
        "PostgreSQL",
        "MongoDB",
        "Tailwind",
        "Styled Components",
        "React Native",
        "Flutter",
        "Swift",
        "Kotlin",
        "C#",
        ".NET",
        "Ruby",
        "PHP",
        "Laravel",
        "Spring",
        "Redis",
        "Kafka",
        "Terraform",
      ];

  return candidates.filter((skill) => {
    const needle = skill.toLowerCase();
    return haystack.includes(needle);
  });
};
