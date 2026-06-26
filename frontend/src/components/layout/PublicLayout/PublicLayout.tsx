import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

export type PublicLayoutProps = {
  children: ReactNode;
  className?: string;
};

export const PublicLayout = ({ children, className }: PublicLayoutProps) => (
  <div className={cn("flex min-h-screen items-center justify-center bg-background p-4", className)}>
    {children}
  </div>
);
