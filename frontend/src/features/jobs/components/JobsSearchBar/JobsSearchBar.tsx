"use client";

import { SearchInput } from "@/components/ui/SearchInput";

export type JobsSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export const JobsSearchBar = ({ value, onChange, className }: JobsSearchBarProps) => (
  <SearchInput
    className={className}
    value={value}
    onChange={(event) => onChange(event.target.value)}
    onClear={() => onChange("")}
    placeholder="Pesquisar por cargo, empresa, tecnologia..."
    aria-label="Pesquisar vagas"
  />
);
