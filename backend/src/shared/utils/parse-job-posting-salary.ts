export type ParsedJobSalary = {
  salaryMin: number;
  salaryMax: number;
} | null;

type QuantitativeValue = {
  minValue?: number;
  maxValue?: number;
  value?: number;
  unitText?: string;
};

type MonetaryAmount = {
  currency?: string;
  value?: number | QuantitativeValue;
  minValue?: number;
  maxValue?: number;
};

type BaseSalaryInput = {
  currency?: string;
  value?: number | QuantitativeValue | MonetaryAmount;
  minValue?: number;
  maxValue?: number;
};

const isBrlCurrency = (currency?: string): boolean => {
  if (!currency) return true;
  const normalized = currency.trim().toUpperCase();
  return normalized === "BRL" || normalized === "R$";
};

const toMonthly = (amount: number, unitText?: string): number => {
  const unit = unitText?.trim().toUpperCase() ?? "";
  if (unit.includes("YEAR") || unit.includes("ANO") || unit.includes("ANNUAL")) {
    return Math.round(amount / 12);
  }
  return Math.round(amount);
};

const resolveRange = (
  minValue?: number,
  maxValue?: number,
  singleValue?: number,
  unitText?: string,
): ParsedJobSalary | null => {
  const min = minValue ?? singleValue;
  const max = maxValue ?? singleValue ?? minValue;

  if (min === undefined && max === undefined) return null;

  const salaryMin = toMonthly(min ?? max!, unitText);
  const salaryMax = toMonthly(max ?? min!, unitText);

  if (!Number.isFinite(salaryMin) || !Number.isFinite(salaryMax) || salaryMin <= 0) {
    return null;
  }

  return {
    salaryMin: Math.min(salaryMin, salaryMax),
    salaryMax: Math.max(salaryMin, salaryMax),
  };
};

const parseQuantitativeValue = (value: QuantitativeValue): ParsedJobSalary | null =>
  resolveRange(value.minValue, value.maxValue, value.value, value.unitText);

const parseMonetaryAmount = (amount: MonetaryAmount): ParsedJobSalary | null => {
  if (!isBrlCurrency(amount.currency)) return null;

  if (typeof amount.value === "number") {
    return resolveRange(amount.minValue, amount.maxValue, amount.value);
  }

  if (amount.value && typeof amount.value === "object") {
    const nested = amount.value as QuantitativeValue & MonetaryAmount;
    if (typeof nested.value === "number" || nested.minValue !== undefined) {
      return parseQuantitativeValue(nested);
    }
    if (!isBrlCurrency(nested.currency)) return null;
    if (typeof nested.value === "object" && nested.value !== null) {
      return parseQuantitativeValue(nested.value as QuantitativeValue);
    }
  }

  return resolveRange(amount.minValue, amount.maxValue);
};

export const parseJobPostingSalary = (baseSalary: unknown): ParsedJobSalary | null => {
  if (!baseSalary || typeof baseSalary !== "object") return null;

  const input = baseSalary as BaseSalaryInput;

  if (!isBrlCurrency(input.currency)) return null;

  if (typeof input.value === "number") {
    return resolveRange(input.minValue, input.maxValue, input.value);
  }

  if (input.value && typeof input.value === "object") {
    const value = input.value as QuantitativeValue & MonetaryAmount;
    if (value.minValue !== undefined || value.maxValue !== undefined || value.value !== undefined) {
      const fromQuantitative = parseQuantitativeValue(value);
      if (fromQuantitative) return fromQuantitative;
    }
    const fromMonetary = parseMonetaryAmount(value);
    if (fromMonetary) return fromMonetary;
  }

  return resolveRange(input.minValue, input.maxValue);
};
