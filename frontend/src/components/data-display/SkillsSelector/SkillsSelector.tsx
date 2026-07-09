"use client";

import { Label } from "@/components/ui/Label";
import { cn } from "@/lib/utils";

import { useSkillsSelector } from "./hooks/use-skills-selector";
import { SkillsChipList } from "./fragments/SkillsChipList";
import { SkillsInputField } from "./fragments/SkillsInputField";
import { SkillsListFilter } from "./fragments/SkillsListFilter";
import type { SkillsSelectorProps } from "./SkillsSelector.types";

export type { SkillsSelectorOption, SkillsSelectorProps } from "./SkillsSelector.types";

export const SkillsSelector = ({
  value,
  onChange,
  options = [],
  label,
  helpText,
  error,
  placeholder = "Digite e pressione Enter...",
  id,
  className,
  useApiSuggestions = true,
  normalizeOnAdd = true,
  sortable = true,
  filterThreshold = 12,
}: SkillsSelectorProps) => {
  const selector = useSkillsSelector({
    value,
    onChange,
    options,
    useApiSuggestions,
    normalizeOnAdd,
    sortable,
    filterThreshold,
    id,
  });

  return (
    <div className={cn("space-y-2", className)}>
      {label ? <Label htmlFor={selector.fieldId}>{label}</Label> : null}
      {helpText ? <p className="text-sm text-muted-foreground">{helpText}</p> : null}

      <SkillsInputField
        fieldId={selector.fieldId}
        value={selector.input}
        placeholder={placeholder}
        error={error}
        suggestions={selector.suggestions}
        activeIndex={selector.activeIndex}
        onChange={selector.handleInputChange}
        onKeyDown={selector.handleKeyDown}
        onPaste={selector.handlePaste}
        onSelectSuggestion={(skillLabel) => void selector.addSkill(skillLabel)}
      />

      {selector.duplicateMessage ? (
        <p className="text-xs text-destructive" role="alert">
          {selector.duplicateMessage}
        </p>
      ) : null}

      {error ? (
        <p id={`${selector.fieldId}-error`} className="text-xs text-destructive">
          {error}
        </p>
      ) : null}

      {selector.showListFilter ? (
        <SkillsListFilter value={selector.listFilter} onChange={selector.setListFilter} />
      ) : null}

      {value.length > 0 ? (
        <SkillsChipList
          skills={selector.filteredSkills}
          allSkills={value}
          enableSortable={selector.enableSortable}
          sensors={selector.sensors}
          onDragEnd={selector.handleDragEnd}
          onRemove={selector.removeSkill}
        />
      ) : null}
    </div>
  );
};
