import type { SystemInfo } from "../entities/system-info.entity.js";

export interface SystemInfoRepository {
  getSystemInfo(): Promise<SystemInfo>;
}
