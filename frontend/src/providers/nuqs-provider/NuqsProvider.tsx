"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { type ReactNode } from "react";

type NuqsProviderProps = {
  children: ReactNode;
};

export const NuqsProvider = ({ children }: NuqsProviderProps) => {
  return <NuqsAdapter>{children}</NuqsAdapter>;
};
