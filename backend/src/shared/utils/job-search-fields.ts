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

const DEFAULT_TECH_CANDIDATES = [
  "React Native",
  "Styled Components",
  "Next.js",
  "Node.js",
  "TypeScript",
  "JavaScript",
  "PostgreSQL",
  "MongoDB",
  "Kubernetes",
  "GraphQL",
  "Terraform",
  "Tailwind",
  "React",
  "Vue",
  "Angular",
  "Python",
  "Java",
  "Docker",
  "AWS",
  "GCP",
  "Azure",
  "Kafka",
  "Redis",
  "Flutter",
  "Swift",
  "Kotlin",
  "C#",
  ".NET",
  "Ruby",
  "PHP",
  "Laravel",
  "Spring",
  "NestJS",
  "Express",
  "Prisma",
  "MySQL",
  "Elasticsearch",
  "RabbitMQ",
  "Jenkins",
  "GitHub Actions",
  "CI/CD",
  "Linux",
  "Figma",
  "Jest",
  "Cypress",
  "Playwright",
  "English",
  "Inglês",
  "Go",
];

const SHORT_TOKEN_PATTERN = /^(go|c#|r|\.net)$/i;

const slugifyTech = (name: string): string => skillMatcher.canonicalize(name);

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const matchesTechInText = (haystack: string, skill: string): boolean => {
  const needle = skill.toLowerCase();
  if (SHORT_TOKEN_PATTERN.test(skill)) {
    const pattern = new RegExp(`(?:^|[^a-z0-9])${escapeRegExp(needle)}(?:[^a-z0-9]|$)`, "i");
    return pattern.test(haystack);
  }
  return haystack.includes(needle);
};

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
  const candidates = knownSkills.length ? knownSkills : DEFAULT_TECH_CANDIDATES;

  return candidates.filter((skill) => matchesTechInText(haystack, skill));
};

export type PlainTextJobSections = {
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
};

const PLAIN_SECTION_PATTERNS: Array<{
  key: keyof PlainTextJobSections;
  patterns: RegExp[];
}> = [
  {
    key: "responsibilities",
    patterns: [
      /^responsabilidades?$/i,
      /^atribui[cç][oõ]es$/i,
      /^o que voc[eê] vai fazer$/i,
      /^suas atividades$/i,
    ],
  },
  {
    key: "requirements",
    patterns: [
      /^requisitos?$/i,
      /^o que buscamos$/i,
      /^necess[aá]rio$/i,
      /^obrigat[oó]ri[oa]s?$/i,
      /^qualifica[cç][oõ]es$/i,
      /^experi[eê]ncia(\s+(necess[aá]ria|desej[aá]vel|obrigat[oó]ria))?$/i,
      /^compet[eê]ncias?$/i,
      /^conhecimentos?$/i,
      /^stack$/i,
      /^tecnologias?$/i,
    ],
  },
  {
    key: "benefits",
    patterns: [/^benef[ií]cios?$/i, /^oferecemos$/i, /^perks?$/i, /^vantagens$/i],
  },
];

const isSectionHeader = (line: string): keyof PlainTextJobSections | null => {
  const trimmed = line.trim().replace(/[:\-–—]+$/, "").trim();
  if (!trimmed || trimmed.length > 60) return null;
  for (const section of PLAIN_SECTION_PATTERNS) {
    if (section.patterns.some((pattern) => pattern.test(trimmed))) {
      return section.key;
    }
  }
  return null;
};

const cleanBullet = (line: string): string =>
  line
    .trim()
    .replace(/^[-*•·\d.)\]]+\s*/, "")
    .trim();

/** Extract requirements/responsibilities/benefits from plain-text job descriptions. */
export const extractSectionsFromPlainText = (text: string): PlainTextJobSections => {
  const requirements: string[] = [];
  const responsibilities: string[] = [];
  const benefits: string[] = [];
  if (!text.trim()) {
    return { requirements, responsibilities, benefits };
  }

  const lines = text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  let current: keyof PlainTextJobSections | null = null;
  for (const line of lines) {
    const header = isSectionHeader(line);
    if (header) {
      current = header;
      continue;
    }
    if (!current) continue;
    const item = cleanBullet(line);
    if (item.length < 2 || item.length > 300) continue;
    if (current === "requirements") requirements.push(item);
    if (current === "responsibilities") responsibilities.push(item);
    if (current === "benefits") benefits.push(item);
  }

  return {
    requirements: [...new Set(requirements)],
    responsibilities: [...new Set(responsibilities)],
    benefits: [...new Set(benefits)],
  };
};
