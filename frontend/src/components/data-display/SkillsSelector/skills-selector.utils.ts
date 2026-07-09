export const skillDedupeKey = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");

export const parsePastedSkills = (text: string): string[] => {
  const parts = text
    .split(/[,;\n]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  const seen = new Set<string>();
  const result: string[] = [];

  for (const part of parts) {
    const key = skillDedupeKey(part);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(part);
  }

  return result;
};
