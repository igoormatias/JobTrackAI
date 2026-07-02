"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { useTheme } from "@/providers/theme-provider";
import type { UserSettings } from "@/types";

import { REFRESH_FREQUENCY_OPTIONS, THEME_OPTIONS } from "../../constants/settings-options";
import {
  accountSettingsSchema,
  type AccountSettingsFormValues,
} from "../../schemas/account-settings.schema";
import { UnsavedChangesBar } from "../UnsavedChangesBar";

export type SettingsFormProps = {
  settings: UserSettings;
  isSaving?: boolean;
  onSubmit: (values: AccountSettingsFormValues) => void;
};

const toFormValues = (settings: UserSettings): AccountSettingsFormValues => ({
  theme: settings.theme,
  jobRefreshFrequency: settings.jobRefreshFrequency,
  dashboardNotificationInterval: settings.dashboardNotificationInterval,
});

export const SettingsForm = ({ settings, isSaving = false, onSubmit }: SettingsFormProps) => {
  const { setTheme } = useTheme();
  const form = useForm<AccountSettingsFormValues>({
    resolver: zodResolver(accountSettingsSchema),
    defaultValues: toFormValues(settings),
    mode: "onChange",
  });

  const { watch, setValue, handleSubmit, reset, formState } = form;

  useEffect(() => {
    reset(toFormValues(settings));
  }, [settings, reset]);

  const submit = handleSubmit((values) => {
    setTheme(values.theme);
    onSubmit(values);
    toast.success("Preferências salvas com sucesso");
  });

  return (
    <form className="space-y-6" onSubmit={submit}>
      <div className="rounded-xl border border-border bg-card p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="settings-theme">Tema</Label>
          <Select
            value={watch("theme")}
            onValueChange={(value) =>
              setValue("theme", value as AccountSettingsFormValues["theme"], { shouldDirty: true })
            }
          >
            <SelectTrigger id="settings-theme">
              <SelectValue placeholder="Selecione o tema" />
            </SelectTrigger>
            <SelectContent>
              {THEME_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="settings-job-refresh">Atualização automática de vagas</Label>
          <Select
            value={watch("jobRefreshFrequency")}
            onValueChange={(value) =>
              setValue("jobRefreshFrequency", value as AccountSettingsFormValues["jobRefreshFrequency"], {
                shouldDirty: true,
              })
            }
          >
            <SelectTrigger id="settings-job-refresh">
              <SelectValue placeholder="Selecione a frequência" />
            </SelectTrigger>
            <SelectContent>
              {REFRESH_FREQUENCY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Define com que frequência a lista de vagas será atualizada quando você estiver na plataforma.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="settings-dashboard-interval">Intervalo de notificações no Dashboard</Label>
          <Select
            value={watch("dashboardNotificationInterval")}
            onValueChange={(value) =>
              setValue(
                "dashboardNotificationInterval",
                value as AccountSettingsFormValues["dashboardNotificationInterval"],
                { shouldDirty: true },
              )
            }
          >
            <SelectTrigger id="settings-dashboard-interval">
              <SelectValue placeholder="Selecione o intervalo" />
            </SelectTrigger>
            <SelectContent>
              {REFRESH_FREQUENCY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Notificações internas exibidas enquanto a plataforma está aberta — não são push nem e-mail.
          </p>
        </div>
      </div>

      <UnsavedChangesBar
        visible={formState.isDirty}
        isSaving={isSaving}
        onDiscard={() => reset(toFormValues(settings))}
        onSave={() => void submit()}
      />
    </form>
  );
};
