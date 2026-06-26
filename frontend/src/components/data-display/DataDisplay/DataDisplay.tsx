"use client";

import { type ReactNode } from "react";

import { Chip } from "@/components/ui/Chip";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { cn } from "@/lib/utils";

export type MultiSelectOption = {
  value: string;
  label: string;
};

export type MultiSelectProps = {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  label?: string;
  className?: string;
};

export const MultiSelect = ({
  options,
  value,
  onChange,
  placeholder = "Selecionar...",
  label,
  className,
}: MultiSelectProps) => {
  const available = options.filter((option) => !value.includes(option.value));

  const handleAdd = (selected: string) => {
    if (!value.includes(selected)) {
      onChange([...value, selected]);
    }
  };

  const handleRemove = (removed: string) => {
    onChange(value.filter((item) => item !== removed));
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label ? <Label>{label}</Label> : null}
      <Select onValueChange={handleAdd} value="">
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {available.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {value.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {value.map((item) => {
            const option = options.find((opt) => opt.value === item);
            return (
              <Chip key={item} onDismiss={() => handleRemove(item)}>
                {option?.label ?? item}
              </Chip>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

export type DataTableColumn<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
};

export type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  emptyMessage?: string;
  className?: string;
};

export const DataTable = <T,>({
  columns,
  data,
  emptyMessage = "Nenhum dado encontrado",
  className,
}: DataTableProps<T>) => (
  <div className={cn("w-full overflow-auto rounded-lg border border-border", className)}>
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border bg-muted/50">
          {columns.map((column) => (
            <th key={column.key} className="px-4 py-3 text-left font-medium text-muted-foreground">
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
              {emptyMessage}
            </td>
          </tr>
        ) : (
          data.map((row, index) => (
            <tr key={index} className="border-b border-border last:border-0">
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3">
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export type KanbanColumnProps = {
  title: string;
  count?: number;
  children: ReactNode;
  className?: string;
};

export const KanbanColumn = ({ title, count, children, className }: KanbanColumnProps) => (
  <div className={cn("flex w-72 shrink-0 flex-col rounded-lg bg-muted/30 p-3", className)}>
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {count !== undefined ? (
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {count}
        </span>
      ) : null}
    </div>
    <div className="flex flex-col gap-2 overflow-y-auto">{children}</div>
  </div>
);

export type KanbanCardProps = {
  title: string;
  company: string;
  statusSlot?: ReactNode;
  className?: string;
};

export const KanbanCard = ({ title, company, statusSlot, className }: KanbanCardProps) => (
  <div className={cn("rounded-lg border border-border bg-card p-3 shadow-sm", className)}>
    <p className="text-sm font-medium text-foreground">{title}</p>
    <p className="mt-1 text-xs text-muted-foreground">{company}</p>
    {statusSlot ? <div className="mt-2">{statusSlot}</div> : null}
  </div>
);

export type TimelineItem = {
  id: string;
  title: string;
  description?: string;
  date?: string;
};

export type TimelineProps = {
  items: TimelineItem[];
  className?: string;
};

export const Timeline = ({ items, className }: TimelineProps) => (
  <div className={cn("relative space-y-4", className)}>
    {items.map((item, index) => (
      <div key={item.id} className="relative flex gap-4 pl-6">
        {index < items.length - 1 ? (
          <span className="absolute left-1.75 top-4 h-full w-px bg-border" />
        ) : null}
        <span className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-primary bg-background" />
        <div>
          <p className="text-sm font-medium text-foreground">{item.title}</p>
          {item.description ? (
            <p className="text-xs text-muted-foreground">{item.description}</p>
          ) : null}
          {item.date ? <p className="mt-1 text-xs text-muted-foreground">{item.date}</p> : null}
        </div>
      </div>
    ))}
  </div>
);
