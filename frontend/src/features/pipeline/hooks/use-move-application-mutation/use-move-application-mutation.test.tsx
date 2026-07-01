import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getPipeline } from "@/features/pipeline/services/pipeline-service";
import { queryKeys } from "@/lib/query-client/query-keys";
import { createQueryWrapper } from "@/test/query-wrapper";

import { useMoveApplicationMutation } from "./use-move-application-mutation";

describe("useMoveApplicationMutation", () => {
  it("moves application with optimistic update", async () => {
    const pipeline = await getPipeline();
    const application = pipeline.columns.flatMap((column) => column.applications)[0]!;
    const { Wrapper, queryClient } = createQueryWrapper();

    await queryClient.prefetchQuery({
      queryKey: queryKeys.pipeline.board({}),
      queryFn: () => getPipeline(),
    });

    const { result } = renderHook(() => useMoveApplicationMutation(), { wrapper: Wrapper });

    result.current.mutate({ id: application.id, stage: "technical_interview" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const cached = queryClient.getQueryData<typeof pipeline>(queryKeys.pipeline.board({}));
    expect(cached?.columns.some((column) => column.stage === "technical_interview")).toBe(true);
  });
});
