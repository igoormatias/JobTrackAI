import type { CalendarProviderPort } from "../../domain/ports/calendar-provider.port.js";

export class GetGoogleCalendarAuthUrlUseCase {
  constructor(private readonly provider: CalendarProviderPort) {}

  execute(userId: string) {
    return { authUrl: this.provider.getAuthUrl(userId) };
  }
}
