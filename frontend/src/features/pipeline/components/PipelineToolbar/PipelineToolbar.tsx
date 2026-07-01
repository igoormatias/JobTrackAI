"use client";

import { Search } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

export type PipelineToolbarProps = {
  search: string;
  sortBy: string;
  sortDirection: string;
  onSearchChange: (value: string) => void;
  onSortByChange: (value: string) => void;
  onSortDirectionChange: (value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
};

export const PipelineToolbar = ({
  search,
  sortBy,
  sortDirection,
  onSearchChange,
  onSortByChange,
  onSortDirectionChange,
  onClearFilters,
  hasActiveFilters,
}: PipelineToolbarProps) => (
  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
    <div className="relative w-full lg:max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Buscar empresa, cargo ou tecnologia"
        className="pl-9"
        aria-label="Buscar no pipeline"
      />
    </div>

    <div className="flex flex-wrap items-center gap-2">
      <Select value={sortBy} onValueChange={onSortByChange}>
        <SelectTrigger className="w-[180px]" aria-label="Ordenar por">
          <SelectValue placeholder="Ordenar" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="updated">Última atualização</SelectItem>
          <SelectItem value="recent">Mais recentes</SelectItem>
          <SelectItem value="match">Maior match</SelectItem>
          <SelectItem value="company">Empresa</SelectItem>
        </SelectContent>
      </Select>

      <Select value={sortDirection} onValueChange={onSortDirectionChange}>
        <SelectTrigger className="w-[120px]" aria-label="Direção da ordenação">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="desc">Desc</SelectItem>
          <SelectItem value="asc">Asc</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters ? (
        <Button type="button" variant="outline" size="sm" onClick={onClearFilters}>
          Limpar filtros
        </Button>
      ) : null}
    </div>
  </div>
);
