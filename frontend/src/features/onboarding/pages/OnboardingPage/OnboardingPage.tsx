"use client";

import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Heading, Muted, Subtitle } from "@/components/typography";
import { cn } from "@/lib/utils";

import { OnboardingStepper } from "../../components/OnboardingStepper";
import {
  AreaStep,
  BlockedSkillsStep,
  LocationStep,
  ModalityStep,
  SalaryStep,
  SeniorityStep,
  SkillsStep,
  SummaryStep,
} from "../../components/steps";
import { useOnboarding } from "../../hooks/use-onboarding";
import { ONBOARDING_LAYOUT } from "../../constants/onboarding-layout";
import { STEP_HELP, STEP_TITLES } from "../../types/onboarding.types";

export const OnboardingPage = () => {
  const {
    step,
    stepIndex,
    totalSteps,
    form,
    updateForm,
    canContinue,
    stepError,
    goNext,
    goBack,
    goToStep,
    isSubmitting,
    isLoading,
  } = useOnboarding();

  if (isLoading) {
    return (
      <div className={cn(ONBOARDING_LAYOUT.page, "gap-4 py-12")}>
        <Muted>Carregando seu progresso...</Muted>
      </div>
    );
  }

  return (
    <div className={ONBOARDING_LAYOUT.page}>
      <div className={ONBOARDING_LAYOUT.header}>
        <Heading level={2}>{STEP_TITLES[step]}</Heading>
        <Subtitle>{STEP_HELP[step]}</Subtitle>
      </div>

      <OnboardingStepper stepIndex={stepIndex} totalSteps={totalSteps}>
        {step === "area" ? (
          <AreaStep
            form={form}
            error={stepError}
            onChange={(area) => {
              if (area !== form.area) {
                updateForm({ area, skills: [], blockedSkills: [] });
              } else {
                updateForm({ area });
              }
            }}
          />
        ) : null}

        {step === "skills" ? (
          <SkillsStep form={form} error={stepError} onChange={(skills) => updateForm({ skills })} />
        ) : null}

        {step === "seniority" ? (
          <SeniorityStep
            form={form}
            error={stepError}
            onChange={(seniority) => updateForm({ seniority })}
          />
        ) : null}

        {step === "modality" ? (
          <ModalityStep
            form={form}
            error={stepError}
            onChange={(modality) => updateForm({ modality })}
          />
        ) : null}

        {step === "location" ? (
          <LocationStep
            form={form}
            error={stepError}
            onChange={(locationPreference) => updateForm({ locationPreference })}
          />
        ) : null}

        {step === "salary" ? (
          <SalaryStep
            form={form}
            error={stepError}
            onChange={(salaryBand) => updateForm({ salaryBand })}
          />
        ) : null}

        {step === "blockedSkills" ? (
          <BlockedSkillsStep
            form={form}
            error={stepError}
            onChange={(blockedSkills) => updateForm({ blockedSkills })}
          />
        ) : null}

        {step === "summary" ? <SummaryStep form={form} onEdit={goToStep} /> : null}

        <div className="flex items-center justify-between gap-3 pt-2">
          <Button variant="ghost" onClick={goBack} disabled={stepIndex === 0 || isSubmitting}>
            Voltar
          </Button>
          <Button onClick={() => void goNext()} disabled={!canContinue || isSubmitting}>
            {step === "summary" ? "Finalizar" : "Próximo"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </OnboardingStepper>
    </div>
  );
};
