import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";

import { AREA_OPTIONS } from "../../constants/areas";
import { getSalaryBandLabel } from "../../constants/salary-bands";
import { MODALITY_OPTIONS, SENIORITY_OPTIONS } from "../../constants/onboarding-options";
import type { OnboardingFormState, OnboardingStep } from "../../types/onboarding.types";
import { formatLocationWithRelocation } from "../../utils/location-formatter";

export type SummaryStepProps = {
  form: OnboardingFormState;
  onEdit: (step: OnboardingStep) => void;
};

const getAreaLabel = (area: OnboardingFormState["area"]) =>
  AREA_OPTIONS.find((option) => option.value === area)?.label ?? "—";

const getSeniorityLabel = (seniority: OnboardingFormState["seniority"]) =>
  SENIORITY_OPTIONS.find((option) => option.value === seniority)?.label ?? "—";

const getModalityLabel = (modality: OnboardingFormState["modality"]) =>
  MODALITY_OPTIONS.find((option) => option.value === modality)?.label ?? "—";

export const SummaryStep = ({ form, onEdit }: SummaryStepProps) => (
  <div className="space-y-4">
    <SummaryCard title="Área profissional" onEdit={() => onEdit("area")}>
      {getAreaLabel(form.area)}
    </SummaryCard>

    <SummaryCard title="Competências principais" onEdit={() => onEdit("skills")}>
      <div className="flex flex-wrap gap-2">
        {form.skills.map((skill) => (
          <Chip key={skill}>{skill}</Chip>
        ))}
      </div>
    </SummaryCard>

    <SummaryCard title="Senioridade" onEdit={() => onEdit("seniority")}>
      {getSeniorityLabel(form.seniority)}
    </SummaryCard>

    <SummaryCard title="Modelo de trabalho" onEdit={() => onEdit("modality")}>
      {getModalityLabel(form.modality)}
    </SummaryCard>

    <SummaryCard title="Localização" onEdit={() => onEdit("location")}>
      {formatLocationWithRelocation(form.locationPreference)}
    </SummaryCard>

    <SummaryCard title="Pretensão salarial" onEdit={() => onEdit("salary")}>
      {getSalaryBandLabel(form.salaryBand)}
    </SummaryCard>

    <SummaryCard title="Competências que não deseja" onEdit={() => onEdit("blockedSkills")}>
      {form.blockedSkills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {form.blockedSkills.map((skill) => (
            <Chip key={skill}>{skill}</Chip>
          ))}
        </div>
      ) : (
        "Nenhuma selecionada"
      )}
    </SummaryCard>
  </div>
);

type SummaryCardProps = {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
};

const SummaryCard = ({ title, onEdit, children }: SummaryCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-base">{title}</CardTitle>
      <Button type="button" variant="ghost" size="sm" onClick={onEdit}>
        Editar
      </Button>
    </CardHeader>
    <CardContent className="text-sm text-muted-foreground">{children}</CardContent>
  </Card>
);
