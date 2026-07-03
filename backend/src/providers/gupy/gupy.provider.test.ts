import { afterEach, describe, expect, it, vi } from "vitest";

import { GupyProvider } from "./gupy.provider.js";
import type { GupyApiResponse } from "./gupy.types.js";

describe("GupyProvider", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should map gupy raw job to normalized job", () => {
    const provider = new GupyProvider();
    const normalized = provider.normalize({
      jobUrl: "https://portal.gupy.io/job/999",
      name: "Desenvolvedor",
      careerPageName: "Empresa X",
      city: "São Paulo",
      state: "SP",
      workplaceType: "remote",
      publishedDate: "2025-06-01T00:00:00.000Z",
    });

    expect(normalized.title).toBe("Desenvolvedor");
    expect(normalized.company).toBe("Empresa X");
    expect(normalized.modality).toBe("remote");
    expect(normalized.externalId).toBe("999");
    expect(normalized.provider).toBe("gupy");
    expect(normalized.contentHash).toHaveLength(64);
  });

  it("should paginate search and stop on stale jobs", async () => {
    const provider = new GupyProvider();
    const staleDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () =>
          ({
            data: [
              {
                jobUrl: "https://portal.gupy.io/job/1",
                name: "Fresh",
                careerPageName: "Co",
                publishedDate: new Date().toISOString(),
              },
              {
                jobUrl: "https://portal.gupy.io/job/2",
                name: "Stale",
                careerPageName: "Co",
                publishedDate: staleDate,
              },
            ],
          }) satisfies GupyApiResponse,
      }),
    );

    const result = await provider.search({ limit: 10, offset: 0 });

    expect(result.jobs).toHaveLength(1);
    expect(result.hasMore).toBe(false);
  });
});
