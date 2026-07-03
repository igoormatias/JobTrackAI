import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { AccountProfile } from "@/types";

import { ProfileForm } from "./ProfileForm";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockProfile: AccountProfile = {
  id: "profile_1",
  userId: "user_1",
  headline: "",
  area: "frontend",
  seniority: "senior",
  modality: "remote",
  location: "Brasil",
  locationPreference: { scope: "country", acceptsRelocation: false },
  salaryExpectation: null,
  salaryBand: "8k_12k",
  skills: [],
  skillNames: ["React"],
  technologies: [],
  avoidedTechnologies: [],
  bio: "",
  linkedinUrl: null,
  githubUrl: null,
  onboardingProgress: null,
  onboardingCompleted: true,
  extensions: {},
  updatedAt: new Date().toISOString(),
  user: {
    name: "Matias Silva",
    email: "matias@email.com",
    avatarUrl: null,
  },
};

describe("ProfileForm", () => {
  it("renders MVP profile fields", () => {
    render(<ProfileForm profile={mockProfile} onSubmit={vi.fn()} />);

    expect(screen.getByLabelText("Área profissional")).toBeInTheDocument();
    expect(screen.getByLabelText("Senioridade")).toBeInTheDocument();
    expect(screen.getByLabelText("Competências")).toBeInTheDocument();
    expect(screen.getByLabelText("Modalidade")).toBeInTheDocument();
  });

  it("does not render V2 fields", () => {
    render(<ProfileForm profile={mockProfile} onSubmit={vi.fn()} />);

    expect(screen.queryByLabelText(/linkedin/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/github/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/biografia/i)).not.toBeInTheDocument();
  });
});