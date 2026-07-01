import { describe, expect, it } from "vitest";

import { getActivityMeta } from "./get-activity-meta";

describe("getActivityMeta", () => {
  it("returns icon and label for each activity type", () => {
    expect(getActivityMeta("job").label).toBe("Nova vaga");
    expect(getActivityMeta("favorite").label).toBe("Favorito");
    expect(getActivityMeta("status_change").label).toBe("Status");
  });
});
