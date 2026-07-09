"use client";

import { cn } from "@/lib/utils";

import type { SkillsSelectorOption } from "../SkillsSelector.types";

export type SkillsSuggestionsListProps = {
  suggestions: SkillsSelectorOption[];
  activeIndex: number;
  onSelect: (label: string) => void;
};

export const SkillsSuggestionsList = ({
  suggestions,
  activeIndex,
  onSelect,
}: SkillsSuggestionsListProps) => (
  <ul
    className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-border bg-popover py-1 shadow-md"
    role="listbox"
  >
    {suggestions.map((suggestion, index) => (
      <li key={suggestion.value}>
        <button
          type="button"
          role="option"
          aria-selected={index === activeIndex}
          className={cn(
            "w-full cursor-pointer px-3 py-2 text-left text-sm hover:bg-muted",
            index === activeIndex && "bg-muted",
          )}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onSelect(suggestion.label)}
        >
          {suggestion.label}
        </button>
      </li>
    ))}
  </ul>
);
