import { beforeEach, describe, expect, it, vi } from "vitest";

describe("token-crypto.utils", () => {
  beforeEach(() => {
    vi.stubEnv("JWT_SECRET", "test-jwt-secret-for-calendar");
    vi.stubEnv("CALENDAR_TOKEN_SECRET", "test-calendar-secret");
    vi.resetModules();
  });

  it("encrypts and decrypts tokens roundtrip", async () => {
    const { encryptToken, decryptToken } = await import("./token-crypto.utils.js");
    const plain = "ya29.test-access-token-value";
    const encrypted = encryptToken(plain);

    expect(encrypted).not.toBe(plain);
    expect(decryptToken(encrypted)).toBe(plain);
  });

  it("falls back to JWT_SECRET when CALENDAR_TOKEN_SECRET is unset", async () => {
    vi.unstubAllEnvs();
    vi.stubEnv("JWT_SECRET", "jwt-only-secret");
    vi.resetModules();

    const { encryptToken, decryptToken } = await import("./token-crypto.utils.js");
    const encrypted = encryptToken("refresh-token");
    expect(decryptToken(encrypted)).toBe("refresh-token");
  });
});
