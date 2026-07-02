import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

export type OnboardingLayoutProps = {
  children: ReactNode;
  className?: string;
};

export const OnboardingLayout = ({ children, className }: OnboardingLayoutProps) => (
  <div className={cn("min-h-screen w-full bg-background px-4 py-8 sm:py-12", className)}>
    <div className="layout-shell w-full max-w-2xl">{children}</div>
  </div>
);
