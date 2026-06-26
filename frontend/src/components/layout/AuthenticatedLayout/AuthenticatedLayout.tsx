"use client";

import { type ReactNode } from "react";

import { AppShell } from "@/components/layout/AppShell";

export type AuthenticatedLayoutProps = {
  children: ReactNode;
};

export const AuthenticatedLayout = ({ children }: AuthenticatedLayoutProps) => (
  <AppShell>{children}</AppShell>
);

export type DashboardLayoutProps = AuthenticatedLayoutProps;

export const DashboardLayout = ({ children }: DashboardLayoutProps) => (
  <AuthenticatedLayout>{children}</AuthenticatedLayout>
);
