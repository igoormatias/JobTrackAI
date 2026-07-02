import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";

import { resetAuthStore } from "@/mocks/fixtures/auth-store";
import { resetFixtureStore } from "@/mocks/fixtures";
import { resetProfileStore } from "@/mocks/fixtures/profile-store";
import { resetNotificationReadState } from "@/mocks/handlers/notifications.handlers";
import { server } from "@/mocks/server";

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock;

afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetFixtureStore();
  resetAuthStore();
  resetProfileStore();
  resetNotificationReadState();
});

afterAll(() => {
  server.close();
});
