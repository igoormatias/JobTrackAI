"use client";

import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

import type { SkillsSelectorOption } from "../SkillsSelector.types";

import { SkillsSuggestionsList } from "./SkillsSuggestionsList";

export type SkillsInputFieldProps = {
  fieldId: string;
  value: string;
  placeholder: string;
  error?: string;
  suggestions: SkillsSelectorOption[];
  activeIndex: number;
  onChange: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste: (event: React.ClipboardEvent<HTMLInputElement>) => void;
  onSelectSuggestion: (label: string) => void;
};

export const SkillsInputField = ({
  fieldId,
  value,
  placeholder,
  error,
  suggestions,
  activeIndex,
  onChange,
  onKeyDown,
  onPaste,
  onSelectSuggestion,
}: SkillsInputFieldProps) => (
  <div className="relative">
    <Input
      id={fieldId}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      onPaste={onPaste}
      placeholder={placeholder}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${fieldId}-error` : undefined}
      className={cn(error && "border-destructive")}
      autoComplete="off"
    />

    {suggestions.length > 0 && value.trim() ? (
      <SkillsSuggestionsList
        suggestions={suggestions}
        activeIndex={activeIndex}
        onSelect={onSelectSuggestion}
      />
    ) : null}
  </div>
);
