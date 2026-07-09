import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";

import { TestProviders } from "./providers";

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

export const createQueryWrapper = (queryClient = createTestQueryClient()) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <TestProviders>{children}</TestProviders>
    </QueryClientProvider>
  );

  return { Wrapper, queryClient };
};
