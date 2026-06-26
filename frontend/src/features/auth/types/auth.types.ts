export type AuthProvider = "google";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  provider: AuthProvider;
  createdAt: string;
  onboardingCompleted: boolean;
};

export type AuthProfile = {
  professionalArea?: string;
  seniority?: string;
  salaryExpectation?: {
    min: number;
    max: number;
    currency: "BRL";
  };
  location?: string;
  skills?: string[];
  blockedSkills?: string[];
};

export type AuthPermissions = {
  canAccessApp: boolean;
  canManageSettings: boolean;
};

export type AuthSession = {
  user: AuthUser;
  profile: AuthProfile | null;
  permissions: AuthPermissions;
  expiresAt: string | null;
};

export type LoginPayload = {
  provider: "google";
  idToken?: string;
};

export type AuthResponse = {
  user: AuthUser;
  profile: AuthProfile | null;
  permissions: AuthPermissions;
};

export type OnboardingCompletePayload = {
  professionalArea: string;
  seniority: string;
  salaryExpectation: {
    min: number;
    max: number;
    currency: "BRL";
  };
  location: string;
  skills: string[];
  blockedSkills: string[];
  modality?: "remote" | "hybrid" | "onsite";
};
