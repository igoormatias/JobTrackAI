export const isMockEnabled = (): boolean => process.env.NEXT_PUBLIC_ENABLE_MSW === "true";

export const initMocks = async (): Promise<void> => {
  if (!isMockEnabled() || typeof window === "undefined") {
    return;
  }

  const { worker } = await import("./browser");

  await worker.start({
    onUnhandledRequest: "bypass",
  });
};

export { resetFixtureStore } from "./fixtures";
