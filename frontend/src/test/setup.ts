import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";

import { resetAuthStore } from "@/mocks/fixtures/auth-store";
import { resetFixtureStore } from "@/mocks/fixtures";
import { server } from "@/mocks/server";

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetFixtureStore();
  resetAuthStore();
});

afterAll(() => {
  server.close();
});
