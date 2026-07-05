import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

export type PublicLayoutProps = {
  children: ReactNode;
  className?: string;
};

export const PublicLayout = ({ children, className }: PublicLayoutProps) => (
  <div className="min-h-screen w-full bg-background px-4 py-8 sm:py-12">
    <div className={cn("layout-shell mx-auto w-full max-w-3xl", className)}>{children}</div>
  </div>
);
