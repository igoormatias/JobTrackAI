export const formatSalaryRange = (
  min: number | null,
  max: number | null,
  currency: "BRL" = "BRL",
): string => {
  if (min === null && max === null) return "A combinar";

  const formatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });

  if (min !== null && max !== null) {
    return `${formatter.format(min)} – ${formatter.format(max)}`;
  }

  if (min !== null) return `A partir de ${formatter.format(min)}`;
  return `Até ${formatter.format(max!)}`;
};
