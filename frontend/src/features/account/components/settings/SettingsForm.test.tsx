import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ThemeProvider } from "@/providers/theme-provider";
import type { UserSettings } from "@/types";

import { REFRESH_FREQUENCY_OPTIONS } from "../../constants/settings-options";
import { SettingsForm } from "./SettingsForm";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockSettings: UserSettings = {
  id: "settings_1",
  userId: "user_1",
  theme: "dark",
  jobRefreshFrequency: "1h",
  dashboardNotificationInterval: "1h",
  updatedAt: new Date().toISOString(),
};

const renderSettingsForm = () =>
  render(
    <ThemeProvider>
      <SettingsForm settings={mockSettings} onSubmit={vi.fn()} />
    </ThemeProvider>,
  );

describe("SettingsForm", () => {
  it("renders MVP preference fields", () => {
    renderSettingsForm();

    expect(screen.getByLabelText("Tema")).toBeInTheDocument();
    expect(screen.getByLabelText("Atualização automática de vagas")).toBeInTheDocument();
    expect(screen.getByLabelText("Intervalo de notificações no Dashboard")).toBeInTheDocument();
  });

  it("uses Até fechar manualmente label for manual refresh option", () => {
    const manualOption = REFRESH_FREQUENCY_OPTIONS.find((option) => option.value === "manual");
    expect(manualOption?.label).toBe("Até fechar manualmente");
  });
});
