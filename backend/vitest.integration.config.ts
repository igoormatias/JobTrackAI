import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.integration.test.ts"],
    env: {
      GOOGLE_CLIENT_ID: "test-google-client-id.apps.googleusercontent.com",
    },
  },
});
