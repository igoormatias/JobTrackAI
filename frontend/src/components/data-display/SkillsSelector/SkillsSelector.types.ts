export type SkillsSelectorOption = {
  value: string;
  label: string;
};

export type SkillsSelectorProps = {
  value: string[];
  onChange: (value: string[]) => void;
  options?: SkillsSelectorOption[];
  label?: string;
  helpText?: string;
  error?: string;
  placeholder?: string;
  id?: string;
  className?: string;
  useApiSuggestions?: boolean;
  normalizeOnAdd?: boolean;
  sortable?: boolean;
  filterThreshold?: number;
};
