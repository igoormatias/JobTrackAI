"use client";

import {
  BarChart3,
  Briefcase,
  Bug,
  ChartColumn,
  ClipboardList,
  Cloud,
  Crown,
  Database,
  Layers,
  Monitor,
  MoreHorizontal,
  Palette,
  Server,
  Smartphone,
  Sparkles,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { ProfessionalArea } from "@/types";

import { AREA_OPTIONS } from "../../constants/areas";
import type { OnboardingFormState } from "../../types/onboarding.types";

const areaIcons = {
  monitor: Monitor,
  server: Server,
  layers: Layers,
  smartphone: Smartphone,
  bug: Bug,
  cloud: Cloud,
  palette: Palette,
  clipboard: ClipboardList,
  chart: ChartColumn,
  users: Users,
  crown: Crown,
  barChart: BarChart3,
  database: Database,
  briefcase: Briefcase,
  sparkles: Sparkles,
  more: MoreHorizontal,
} as const;

export type AreaStepProps = {
  form: OnboardingFormState;
  onChange: (area: ProfessionalArea) => void;
  error?: string | null;
};

export const AreaStep = ({ form, onChange, error }: AreaStepProps) => (
  <div className="space-y-3">
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Área profissional">
      {AREA_OPTIONS.map((option) => {
        const Icon = areaIcons[option.icon];
        const isSelected = form.area === option.value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card p-4 text-sm font-medium transition-colors",
              isSelected && "border-primary bg-primary/10 text-primary",
            )}
          >
            <Icon className="h-5 w-5" />
            {option.label}
          </button>
        );
      })}
    </div>
    {error ? (
      <p className="text-sm text-destructive" role="alert">
        {error}
      </p>
    ) : null}
  </div>
);
