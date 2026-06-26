export const onboardingQueryKeys = {
  all: ["onboarding"] as const,
  profile: () => [...onboardingQueryKeys.all, "profile"] as const,
};
