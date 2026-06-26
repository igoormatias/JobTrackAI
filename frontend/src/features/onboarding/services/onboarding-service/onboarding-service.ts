import { completeOnboarding } from "@/features/auth/services/auth-service";
import type { OnboardingCompletePayload } from "@/features/auth/types";

export const submitOnboarding = async (payload: OnboardingCompletePayload) => completeOnboarding(payload);
