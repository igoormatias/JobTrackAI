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

export type SalaryExpectation = {
  min: number;
  max: number;
  currency: "BRL";
};

export type AuthProfile = {
  professionalArea?: string;
  seniority?: string;
  salaryExpectation?: SalaryExpectation;
  location?: string;
  skills?: string[];
  blockedSkills?: string[];
};

export type AuthPermissions = {
  canAccessApp: boolean;
  canManageSettings: boolean;
};

export type AuthSessionPayload = {
  userId: string;
  email: string;
  type: "access" | "refresh";
};

export type GoogleUser = {
  sub: string;
  email: string;
  name: string;
  picture: string | null;
};
