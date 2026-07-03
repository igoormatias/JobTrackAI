import { describe, expect, it } from "vitest";

import { parseTxtBuffer } from "./txt.parser.js";

describe("txt.parser", () => {
  it("extracts utf-8 text", () => {
    expect(parseTxtBuffer(Buffer.from("Hello\nWorld", "utf-8"))).toBe("Hello\nWorld");
  });
});
