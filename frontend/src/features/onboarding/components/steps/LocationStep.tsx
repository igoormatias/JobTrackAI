"use client";

import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { cn } from "@/lib/utils";
import type { ProfileLocation } from "@/types";

import { BRAZIL_STATES } from "../../constants/brazil-states";
import { LOCATION_SCOPE_OPTIONS } from "../../constants/onboarding-options";
import type { OnboardingFormState } from "../../types/onboarding.types";

export type LocationStepProps = {
  form: OnboardingFormState;
  onChange: (locationPreference: ProfileLocation) => void;
  error?: string | null;
};

export const LocationStep = ({ form, onChange, error }: LocationStepProps) => {
  const { locationPreference } = form;

  const update = (patch: Partial<ProfileLocation>) => {
    onChange({ ...locationPreference, ...patch });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Escopo de localização">
        {LOCATION_SCOPE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={locationPreference.scope === option.value}
            onClick={() => update({ scope: option.value })}
            className={cn(
              "cursor-pointer rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium transition-colors",
              locationPreference.scope === option.value && "border-primary bg-primary/10 text-primary",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {locationPreference.scope === "state" ? (
        <div className="space-y-2">
          <Label htmlFor="onboarding-state">Estado</Label>
          <Select value={locationPreference.state ?? ""} onValueChange={(value) => update({ state: value })}>
            <SelectTrigger id="onboarding-state">
              <SelectValue placeholder="Selecione o estado" />
            </SelectTrigger>
            <SelectContent>
              {BRAZIL_STATES.map((state) => (
                <SelectItem key={state.value} value={state.value}>
                  {state.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {locationPreference.scope === "city" ? (
        <div className="space-y-2">
          <Label htmlFor="onboarding-city">Cidade</Label>
          <Input
            id="onboarding-city"
            value={locationPreference.city ?? ""}
            onChange={(event) => update({ city: event.target.value })}
            placeholder="Ex: São Paulo"
          />
        </div>
      ) : null}

      <div className="flex items-center gap-2">
        <Checkbox
          id="onboarding-relocation"
          checked={locationPreference.acceptsRelocation}
          onCheckedChange={(checked) => update({ acceptsRelocation: checked === true })}
        />
        <Label htmlFor="onboarding-relocation">Aceita mudança</Label>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
};
