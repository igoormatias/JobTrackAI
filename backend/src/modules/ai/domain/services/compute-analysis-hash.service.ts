import { createHash } from "node:crypto";

import type { AnalysisSnapshot } from "../entities/career-analysis.entity.js";

function stableStringify(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (Array.isArray(value)) return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const keys = Object.keys(record).sort();
    return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export const computeAnalysisHash = (snapshot: AnalysisSnapshot): string => {
  const payload = stableStringify(snapshot);
  return createHash("sha256").update(payload).digest("hex");
};
