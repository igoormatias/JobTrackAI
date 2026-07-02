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

export type AuthProfileLocation = {
  scope: "country" | "state" | "city";
  state?: string;
  city?: string;
  acceptsRelocation: boolean;
};

export type AuthProfile = {
  professionalArea?: string;
  seniority?: string;
  salaryExpectation?: {
    min: number;
    max: number;
    currency: "BRL";
  };
  salaryBand?: string;
  location?: string;
  locationPreference?: AuthProfileLocation;
  skills?: string[];
  blockedSkills?: string[];
  modality?: "remote" | "hybrid" | "onsite" | "any";
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
  idToken: string;
};

export type AuthResponse = {
  user: AuthUser;
  profile: AuthProfile | null;
  permissions: AuthPermissions;
};

export type OnboardingCompletePayload = {
  professionalArea: string;
  seniority: string;
  modality: "remote" | "hybrid" | "onsite" | "any";
  location: string;
  locationPreference: AuthProfileLocation;
  salaryBand: string;
  salaryExpectation: {
    min: number;
    max: number;
    currency: "BRL";
  };
  skills: string[];
  blockedSkills: string[];
};
