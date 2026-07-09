"use client";

import { Input } from "@/components/ui/Input";

export type SkillsListFilterProps = {
  value: string;
  onChange: (value: string) => void;
};

export const SkillsListFilter = ({ value, onChange }: SkillsListFilterProps) => (
  <Input
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder="Pesquisar na lista..."
    className="h-8 text-sm"
    aria-label="Pesquisar competências"
  />
);
