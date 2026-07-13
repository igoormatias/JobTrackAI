import { slugifySkill } from "./skill-slug.js";

/** Alias slug → canonical slug. Single source for match comparisons. */
export const SKILL_ALIASES: Record<string, string> = {
  reactjs: "react",
  "react-js": "react",
  react: "react",
  nodejs: "node-js",
  "node-js": "node-js",
  node: "node-js",
  ts: "typescript",
  typescript: "typescript",
  js: "javascript",
  javascript: "javascript",
  nextjs: "next-js",
  "next-js": "next-js",
  next: "next-js",
  vuejs: "vue",
  vue: "vue",
  angularjs: "angular",
  angular: "angular",
  k8s: "kubernetes",
  kubernetes: "kubernetes",
  postgres: "postgresql",
  postgresql: "postgresql",
  psql: "postgresql",
  mongo: "mongodb",
  mongodb: "mongodb",
  gcp: "google-cloud",
  "google-cloud": "google-cloud",
  "google-cloud-platform": "google-cloud",
  aws: "aws",
  "amazon-web-services": "aws",
  graphql: "graphql",
  gql: "graphql",
  docker: "docker",
  terraform: "terraform",
  tf: "terraform",
  kafka: "kafka",
};

export const canonicalizeSkill = (name: string): string => {
  const slug = slugifySkill(name);
  if (!slug) return "";
  return SKILL_ALIASES[slug] ?? slug;
};

export const canonicalizeSkills = (names: string[]): string[] => [
  ...new Set(names.map((name) => canonicalizeSkill(name)).filter(Boolean)),
];

export const skillsMatch = (profileSkill: string, jobTerm: string): boolean => {
  const profileSlug = canonicalizeSkill(profileSkill);
  const jobSlug = canonicalizeSkill(jobTerm);
  if (!profileSlug || !jobSlug) return false;
  if (profileSlug === jobSlug) return true;
  return profileSlug.includes(jobSlug) || jobSlug.includes(profileSlug);
};
