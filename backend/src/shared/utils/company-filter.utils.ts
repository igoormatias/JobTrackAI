/** Normalize legacy `company_*` ids to slugs for catalog filtering. */
export const normalizeCompanyFilterValues = (values?: string[]): string[] | undefined => {
  if (!values?.length) return undefined;
  return values.map((value) => (value.startsWith("company_") ? value.slice("company_".length) : value));
};
