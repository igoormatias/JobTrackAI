"use client";

import { type ReactNode } from "react";

import { AuthProvider } from "./AuthProvider";

type SessionProviderProps = {
  children: ReactNode;
};

export const SessionProvider = ({ children }: SessionProviderProps) => (
  <AuthProvider>{children}</AuthProvider>
);
