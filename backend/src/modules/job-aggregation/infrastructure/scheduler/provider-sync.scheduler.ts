import { logger } from "../../../../config/logger.js";
import type { RunAllProvidersUseCase } from "../../application/use-cases/run-providers.use-cases.js";

export class ProviderSyncScheduler {
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private readonly runAllProvidersUseCase: RunAllProvidersUseCase,
    private readonly intervalMs: number,
  ) {}

  start(): void {
    if (this.timer) return;

    this.timer = setInterval(() => {
      void this.runAllProvidersUseCase.execute().catch((error) => {
        logger.error({ error }, "Scheduled provider sync failed");
      });
    }, this.intervalMs);

    logger.info({ intervalMs: this.intervalMs }, "Provider sync scheduler started");
  }

  stop(): void {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  }
}
