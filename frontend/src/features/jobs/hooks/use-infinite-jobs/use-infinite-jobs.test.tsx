import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { describe, expect, it } from "vitest";

import { useInfiniteJobs } from "./use-infinite-jobs";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <NuqsAdapter>
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      {children}
    </QueryClientProvider>
  </NuqsAdapter>
);

describe("useInfiniteJobs", () => {
  it("loads first page and exposes pagination meta", async () => {
    const { result } = renderHook(() => useInfiniteJobs({ limit: 10, sortBy: "match" }), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.pages[0]?.data).toHaveLength(10);
    expect(result.current.data?.pages[0]?.meta.hasMore).toBe(true);
  });
});
