import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

export type PublicLayoutProps = {
  children: ReactNode;
  className?: string;
};

export const PublicLayout = ({ children, className }: PublicLayoutProps) => (
  <div className={cn("min-h-screen w-full bg-background px-4 py-8 sm:py-12", className)}>
    <div className="layout-shell w-full max-w-[400px]">{children}</div>
  </div>
);
