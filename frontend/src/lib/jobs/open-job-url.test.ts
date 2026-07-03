import { afterEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";

import { openJobUrl } from "./open-job-url";

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe("openJobUrl", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("opens valid http url in new tab", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    const result = openJobUrl({ sourceUrl: "https://portal.gupy.io/job/12345", status: "active" });
    expect(result).toBe(true);
    expect(openSpy).toHaveBeenCalledWith(
      "https://portal.gupy.io/job/12345",
      "_blank",
      "noopener,noreferrer",
    );
  });

  it("shows toast when url is missing", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    const result = openJobUrl({ sourceUrl: "" });
    expect(result).toBe(false);
    expect(openSpy).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
  });

  it("shows toast when job is closed", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    const result = openJobUrl({ sourceUrl: "https://example.com", status: "closed" });
    expect(result).toBe(false);
    expect(openSpy).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
  });
});
