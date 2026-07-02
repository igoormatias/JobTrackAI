"use client";

import type { ReactNode } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";

import { AccountTabsNav } from "./AccountTabsNav";

export type AccountSectionLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
};

export const AccountSectionLayout = ({
  title,
  description,
  children,
  className,
}: AccountSectionLayoutProps) => (
  <div className={cn("space-y-6 pb-24", className)}>
    <PageHeader title={title} description={description} />
    <AccountTabsNav />
    {children}
  </div>
);
