import { type ReactNode } from "react";

import { TooltipProvider } from "@/components/ui/Tooltip";

export const TestProviders = ({ children }: { children: ReactNode }) => (
  <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
);
