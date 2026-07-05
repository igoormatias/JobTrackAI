import type { RefreshFrequency } from "@/types";

export const REFRESH_INTERVAL_MS: Record<RefreshFrequency, number | false> = {
  "15m": 900_000,
  "30m": 1_800_000,
  "1h": 3_600_000,
  "2h": 7_200_000,
  manual: false,
};

export const resolveRefreshIntervalMs = (frequency?: RefreshFrequency): number | false => {
  if (!frequency) return REFRESH_INTERVAL_MS["1h"];
  return REFRESH_INTERVAL_MS[frequency] ?? REFRESH_INTERVAL_MS["1h"];
};
