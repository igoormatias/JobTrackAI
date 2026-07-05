import type { CalendarIntegrationRepository } from "../../domain/repositories/calendar-integration.repository.js";

export class DisconnectCalendarUseCase {
  constructor(private readonly repository: CalendarIntegrationRepository) {}

  async execute(userId: string) {
    await this.repository.revoke(userId);
    return { connected: false };
  }
}
