"use client";

import { type ReactNode } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { ProviderAutoSync } from "@/features/dashboard/components/ProviderAutoSync";

export type AuthenticatedLayoutProps = {
  children: ReactNode;
};

export const AuthenticatedLayout = ({ children }: AuthenticatedLayoutProps) => (
  <AppShell>
    <ProviderAutoSync />
    {children}
  </AppShell>
);

export type DashboardLayoutProps = AuthenticatedLayoutProps;

export const DashboardLayout = ({ children }: DashboardLayoutProps) => (
  <AuthenticatedLayout>{children}</AuthenticatedLayout>
);
