import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

export type OnboardingLayoutProps = {
  children: ReactNode;
  className?: string;
};

export const OnboardingLayout = ({ children, className }: OnboardingLayoutProps) => (
  <div className={cn("min-h-screen bg-background px-4 py-8", className)}>{children}</div>
);
