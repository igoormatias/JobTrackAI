"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import type { JobSortField, SortDirection } from "@/types";

import { JOB_SORT_OPTIONS } from "../../constants/jobs-constants";

export type JobsSortSelectProps = {
  sort: JobSortField;
  direction: SortDirection;
  onSortChange: (sort: JobSortField) => void;
  onDirectionChange: (direction: SortDirection) => void;
};

export const JobsSortSelect = ({ sort, direction, onSortChange }: JobsSortSelectProps) => (
  <div className="flex items-center gap-2">
    <span className="text-sm text-muted-foreground">Ordenar por:</span>
    <Select value={sort} onValueChange={(value) => onSortChange(value as JobSortField)}>
      <SelectTrigger className="w-[200px]" aria-label="Ordenar vagas">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {JOB_SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
            {option.value === "salary" || option.value === "match" || option.value === "date"
              ? direction === "desc"
                ? ""
                : " (asc)"
              : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);
