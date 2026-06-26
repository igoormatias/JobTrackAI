"use client";

import { Settings } from "lucide-react";

import { EmptyState } from "@/components/feedback/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Label } from "@/components/ui/Label";
import { Switch } from "@/components/ui/Switch";

export const SettingsPlaceholderPage = () => (
  <div className="space-y-6">
    <PageHeader title="Ajustes" description="Preferências da aplicação." />
    <div className="space-y-4 rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <Label htmlFor="dark-mode">Modo escuro</Label>
        <Switch id="dark-mode" defaultChecked disabled />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="notifications">Notificações</Label>
        <Switch id="notifications" defaultChecked disabled />
      </div>
    </div>
    <EmptyState
      icon={Settings}
      title="Em breve"
      description="Mais configurações serão adicionadas nas próximas etapas."
    />
  </div>
);
