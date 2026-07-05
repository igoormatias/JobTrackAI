"use client";

import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Slider } from "@/components/ui/Slider";
import type { JobSource, ProfessionalArea, Seniority, WorkModality } from "@/types";

import {
  JOB_AREA_OPTIONS,
  JOB_MODALITY_OPTIONS,
  JOB_SENIORITY_OPTIONS,
  JOB_SOURCE_OPTIONS,
} from "../../constants/jobs-constants";
import type { useJobFilters } from "../../hooks/use-job-filters";

type FilterState = ReturnType<typeof useJobFilters>["urlState"];

export type JobsFilterFieldsProps = {
  urlState: FilterState;
  setUrlState: ReturnType<typeof useJobFilters>["setUrlState"];
  companies: { id: string; slug: string; name: string }[];
};

const toggleArrayValue = <T extends string>(values: T[], value: T): T[] =>
  values.includes(value) ? values.filter((item) => item !== value) : [...values, value];

export const JobsFilterFields = ({ urlState, setUrlState, companies }: JobsFilterFieldsProps) => (
  <div className="space-y-6">
    <section className="space-y-3">
      <h4 className="text-sm font-medium">Área profissional</h4>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {JOB_AREA_OPTIONS.map((option) => (
          <label key={option.value} className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={urlState.areas.includes(option.value)}
              onCheckedChange={() =>
                void setUrlState({
                  areas: toggleArrayValue(urlState.areas, option.value as ProfessionalArea),
                })
              }
            />
            {option.label}
          </label>
        ))}
      </div>
    </section>

    <section className="space-y-3">
      <h4 className="text-sm font-medium">Empresa</h4>
      <div className="max-h-40 space-y-2 overflow-y-auto scrollbar-app pr-1">
        {companies.slice(0, 12).map((company) => (
          <label key={company.slug} className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={urlState.companyIds.includes(company.slug)}
              onCheckedChange={() =>
                void setUrlState({
                  companyIds: toggleArrayValue(urlState.companyIds, company.slug),
                })
              }
            />
            {company.name}
          </label>
        ))}
      </div>
    </section>

    <section className="space-y-3">
      <h4 className="text-sm font-medium">Senioridade</h4>
      <div className="flex flex-wrap gap-2">
        {JOB_SENIORITY_OPTIONS.map((option) => (
          <label key={option.value} className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={urlState.seniorities.includes(option.value)}
              onCheckedChange={() =>
                void setUrlState({
                  seniorities: toggleArrayValue(urlState.seniorities, option.value as Seniority),
                })
              }
            />
            {option.label}
          </label>
        ))}
      </div>
    </section>

    <section className="space-y-3">
      <h4 className="text-sm font-medium">Modalidade</h4>
      <div className="flex flex-wrap gap-2">
        {JOB_MODALITY_OPTIONS.map((option) => (
          <label key={option.value} className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={urlState.modalities.includes(option.value)}
              onCheckedChange={() =>
                void setUrlState({
                  modalities: toggleArrayValue(urlState.modalities, option.value as WorkModality),
                })
              }
            />
            {option.label}
          </label>
        ))}
      </div>
    </section>

    <section className="space-y-3">
      <Label htmlFor="jobs-location-filter">Localização</Label>
      <Input
        id="jobs-location-filter"
        value={urlState.location}
        onChange={(event) => void setUrlState({ location: event.target.value })}
        placeholder="Ex.: São Paulo"
      />
    </section>

    <section className="space-y-3">
      <h4 className="text-sm font-medium">Faixa salarial mínima</h4>
      <Slider
        min={0}
        max={30000}
        step={500}
        value={[urlState.salaryMin ?? 0]}
        onValueChange={([value]) => void setUrlState({ salaryMin: value })}
        aria-label="Salário mínimo"
      />
      <p className="text-xs text-muted-foreground">
        A partir de R$ {(urlState.salaryMin ?? 0).toLocaleString("pt-BR")}
      </p>
    </section>

    <section className="space-y-3">
      <h4 className="text-sm font-medium">Match Score mínimo</h4>
      <Slider
        min={0}
        max={100}
        step={5}
        value={[urlState.matchMin ?? 0]}
        onValueChange={([value]) => void setUrlState({ matchMin: value })}
        aria-label="Match score mínimo"
      />
      <p className="text-xs text-muted-foreground">Mínimo: {urlState.matchMin ?? 0}%</p>
    </section>

    <section className="space-y-3">
      <h4 className="text-sm font-medium">Fonte</h4>
      <div className="flex flex-wrap gap-2">
        {JOB_SOURCE_OPTIONS.map((option) => (
          <label key={option.value} className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={urlState.sources.includes(option.value)}
              onCheckedChange={() =>
                void setUrlState({
                  sources: toggleArrayValue(urlState.sources, option.value as JobSource),
                })
              }
            />
            {option.label}
          </label>
        ))}
      </div>
    </section>

    <section className="space-y-3">
      <Label htmlFor="jobs-date-from">Data (de)</Label>
      <Input
        id="jobs-date-from"
        type="date"
        value={urlState.dateFrom ?? ""}
        onChange={(event) => void setUrlState({ dateFrom: event.target.value || null })}
      />
      <Label htmlFor="jobs-date-to">Data (até)</Label>
      <Input
        id="jobs-date-to"
        type="date"
        value={urlState.dateTo ?? ""}
        onChange={(event) => void setUrlState({ dateTo: event.target.value || null })}
      />
    </section>
  </div>
);
