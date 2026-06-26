import { logger } from "../../../config/logger.js";

export class SchedulerService {
  start(): void {
    // Cron jobs will be registered in a future stage.
    logger.info("Scheduler module initialized (no jobs registered)");
  }
}
