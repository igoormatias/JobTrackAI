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
import { BRAZIL_STATES } from "@/features/onboarding/constants/brazil-states";
import { LOCATION_SCOPE_OPTIONS } from "@/features/onboarding/constants/onboarding-options";
import { cn } from "@/lib/utils";
import type { ProfileLocation } from "@/types";

export type AccountLocationFieldsProps = {
  value: ProfileLocation;
  onChange: (locationPreference: ProfileLocation) => void;
  error?: string;
};

export const AccountLocationFields = ({ value, onChange, error }: AccountLocationFieldsProps) => {
  const update = (patch: Partial<ProfileLocation>) => {
    onChange({ ...value, ...patch });
  };

  return (
    <div className="space-y-4">
      <Label>Localização preferida</Label>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Escopo de localização">
        {LOCATION_SCOPE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={value.scope === option.value}
            onClick={() => update({ scope: option.value })}
            className={cn(
              "cursor-pointer rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium transition-colors",
              value.scope === option.value && "border-primary bg-primary/10 text-primary",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {value.scope === "state" ? (
        <div className="space-y-2">
          <Label htmlFor="account-state">Estado</Label>
          <Select value={value.state ?? ""} onValueChange={(state) => update({ state })}>
            <SelectTrigger id="account-state">
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

      {value.scope === "city" ? (
        <div className="space-y-2">
          <Label htmlFor="account-city">Cidade</Label>
          <Input
            id="account-city"
            value={value.city ?? ""}
            onChange={(event) => update({ city: event.target.value })}
            placeholder="Ex: São Paulo"
          />
        </div>
      ) : null}

      <div className="flex items-center gap-2">
        <Checkbox
          id="account-relocation"
          checked={value.acceptsRelocation}
          onCheckedChange={(checked) => update({ acceptsRelocation: checked === true })}
        />
        <Label htmlFor="account-relocation" className="font-normal">
          Aceito realocação para outras regiões
        </Label>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
};
