/**
 * Preserves user-imported career-page URLs when Gupy sync returns generic portal URLs.
 * ADR-030: never reconstruct URLs at runtime — only merge when sync would downgrade quality.
 */

export const isGupyPortalUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url.trim());
    return parsed.hostname === "portal.gupy.io" && /^\/job\/\d+\/?$/i.test(parsed.pathname);
  } catch {
    return false;
  }
};

export const isGupyCareerPageUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url.trim());
    return (
      parsed.hostname.endsWith("gupy.io") &&
      parsed.hostname !== "portal.gupy.io" &&
      /^\/jobs\/\d+\/?$/i.test(parsed.pathname)
    );
  } catch {
    return false;
  }
};

export const isValidHttpUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

/**
 * When syncing catalog jobs, prefer an existing career-page URL over an incoming portal URL.
 */
export const resolveSourceUrlOnSync = (
  existing: string | null | undefined,
  incoming: string | null | undefined,
): string | null | undefined => {
  if (!incoming?.trim()) return existing ?? null;
  if (!existing?.trim()) return incoming.trim();

  const existingTrimmed = existing.trim();
  const incomingTrimmed = incoming.trim();

  if (existingTrimmed === incomingTrimmed) return existingTrimmed;

  if (isGupyPortalUrl(incomingTrimmed) && isGupyCareerPageUrl(existingTrimmed)) {
    return existingTrimmed;
  }

  if (isGupyCareerPageUrl(incomingTrimmed) && isGupyPortalUrl(existingTrimmed)) {
    return incomingTrimmed;
  }

  return incomingTrimmed;
};

/**
 * On URL import confirm, update stored URL when user pasted a valid different URL.
 */
export const shouldUpdateSourceUrlOnImport = (
  existing: string | null | undefined,
  imported: string | null | undefined,
): boolean => {
  if (!imported?.trim() || !isValidHttpUrl(imported)) return false;
  if (!existing?.trim()) return true;
  return existing.trim() !== imported.trim();
};
