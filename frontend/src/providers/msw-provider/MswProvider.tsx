"use client";

import { type ReactNode, useEffect, useState } from "react";

type MswProviderProps = {
  children: ReactNode;
};

export const MswProvider = ({ children }: MswProviderProps) => {
  const [ready, setReady] = useState(process.env.NEXT_PUBLIC_ENABLE_MSW !== "true");

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENABLE_MSW !== "true") {
      return;
    }

    const enableMocks = async () => {
      const { initMocks } = await import("@/mocks");
      await initMocks();
      setReady(true);
    };

    void enableMocks();
  }, []);

  if (!ready) {
    return null;
  }

  return children;
};
