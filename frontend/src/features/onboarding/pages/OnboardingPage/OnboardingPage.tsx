"use client";

import {
  ArrowRight,
  Bug,
  ChartColumn,
  ClipboardList,
  Cloud,
  Crown,
  Layers,
  Monitor,
  Palette,
  Server,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Chip } from "@/components/ui/Chip";
import { Heading, Muted, Subtitle } from "@/components/typography";
import { cn } from "@/lib/utils";

import { useOnboarding } from "../../hooks/use-onboarding";
import {
  AREA_OPTIONS,
  MODALITY_OPTIONS,
  SENIORITY_OPTIONS,
  SKILL_OPTIONS,
} from "../../types";

const areaIcons = {
  monitor: Monitor,
  server: Server,
  layers: Layers,
  bug: Bug,
  cloud: Cloud,
  palette: Palette,
  clipboard: ClipboardList,
  chart: ChartColumn,
  crown: Crown,
} as const;

export const OnboardingPage = () => {
  const {
    step,
    stepIndex,
    totalSteps,
    form,
    updateForm,
    toggleSkill,
    canContinue,
    goNext,
    goBack,
    isSubmitting,
  } = useOnboarding();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <div className="space-y-2">
        <Muted>
          Passo {stepIndex + 1} de {totalSteps}
        </Muted>
        <Heading level={2}>
          {step === "area" && "Qual sua área profissional?"}
          {step === "seniority" && "Qual sua senioridade?"}
          {step === "modality" && "Qual modalidade prefere?"}
          {step === "location" && "Onde você mora?"}
          {step === "salary" && "Qual sua pretensão salarial?"}
          {step === "skills" && "Quais competências você domina?"}
        </Heading>
        <Subtitle>
          Personalize sua jornada. O JobTrack AI usará isso para filtrar as melhores oportunidades.
        </Subtitle>
      </div>

      {step === "area" ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {AREA_OPTIONS.map((option) => {
            const Icon = areaIcons[option.icon as keyof typeof areaIcons] ?? Monitor;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => updateForm({ professionalArea: option.value })}
                className={cn(
                  "flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card p-4 text-sm font-medium transition-colors",
                  form.professionalArea === option.value && "border-primary bg-primary/10 text-primary",
                )}
              >
                <Icon className="h-5 w-5" />
                {option.label}
              </button>
            );
          })}
        </div>
      ) : null}

      {step === "seniority" ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {SENIORITY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateForm({ seniority: option.value })}
              className={cn(
                "rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium transition-colors",
                form.seniority === option.value && "border-primary bg-primary/10 text-primary",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}

      {step === "modality" ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {MODALITY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateForm({ modality: option.value })}
              className={cn(
                "rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium transition-colors",
                form.modality === option.value && "border-primary bg-primary/10 text-primary",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}

      {step === "location" ? (
        <Input
          value={form.location}
          onChange={(event) => updateForm({ location: event.target.value })}
          placeholder="Ex: São Paulo, SP"
        />
      ) : null}

      {step === "salary" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            type="number"
            value={form.salaryExpectation.min}
            onChange={(event) =>
              updateForm({
                salaryExpectation: {
                  ...form.salaryExpectation,
                  min: Number(event.target.value),
                },
              })
            }
            placeholder="Mínimo"
          />
          <Input
            type="number"
            value={form.salaryExpectation.max}
            onChange={(event) =>
              updateForm({
                salaryExpectation: {
                  ...form.salaryExpectation,
                  max: Number(event.target.value),
                },
              })
            }
            placeholder="Máximo"
          />
        </div>
      ) : null}

      {step === "skills" ? (
        <div className="flex flex-wrap gap-2">
          {SKILL_OPTIONS.map((skill) => (
            <button key={skill} type="button" onClick={() => toggleSkill(skill)}>
              <Chip
                className={cn(
                  "cursor-pointer",
                  form.skills.includes(skill) && "border-primary bg-primary/10 text-primary",
                )}
              >
                {skill}
              </Chip>
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3 pt-4">
        <Button variant="ghost" onClick={goBack} disabled={stepIndex === 0 || isSubmitting}>
          Voltar
        </Button>
        <Button onClick={goNext} disabled={!canContinue || isSubmitting}>
          {stepIndex === totalSteps - 1 ? "Concluir" : "Próximo"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
