import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockSetUrlState = vi.fn();
let mockUrlSearch = "";

vi.mock("nuqs", () => ({
  parseAsArrayOf: () => ({ withDefault: (d: unknown) => d }),
  parseAsBoolean: {},
  parseAsInteger: {},
  parseAsString: { withDefault: (d: string) => d },
  parseAsStringLiteral: () => ({ withDefault: (d: unknown) => d }),
  useQueryStates: () => [
    {
      search: mockUrlSearch,
      sort: "match",
      dir: "desc",
      areas: [],
      companyIds: [],
      seniorities: [],
      modalities: [],
      location: "",
      salaryMin: null,
      salaryMax: null,
      skills: [],
      matchMin: null,
      dateFrom: null,
      dateTo: null,
      isFavorite: null,
      sources: [],
    },
    mockSetUrlState,
  ],
}));

import { useJobFilters } from "./use-job-filters";

describe("useJobFilters", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockUrlSearch = "";
    mockSetUrlState.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("keeps search draft local while debouncing URL sync", () => {
    const { result } = renderHook(() => useJobFilters());

    act(() => {
      result.current.setSearchInputValue("react");
    });

    expect(result.current.searchInputValue).toBe("react");
    expect(mockSetUrlState).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(mockSetUrlState).toHaveBeenCalledWith({ search: "react" });
  });
});
