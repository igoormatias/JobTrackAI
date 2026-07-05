import { prisma } from "../../../../database/prisma.js";
import { encryptToken } from "../../../../shared/utils/token-crypto.utils.js";
import type {
  CalendarIntegrationRecord,
  CalendarIntegrationRepository,
  UpsertCalendarIntegrationInput,
} from "../../domain/repositories/calendar-integration.repository.js";

const mapRow = (row: {
  id: string;
  userId: string;
  provider: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiry: Date | null;
  calendarId: string | null;
  scope: string | null;
  accountEmail: string | null;
  lastSyncAt: Date | null;
  lastError: string | null;
  connectedAt: Date;
  revokedAt: Date | null;
}): CalendarIntegrationRecord => ({
  id: row.id,
  userId: row.userId,
  provider: row.provider,
  accessToken: row.accessToken,
  refreshToken: row.refreshToken,
  tokenExpiry: row.tokenExpiry,
  calendarId: row.calendarId,
  scope: row.scope,
  accountEmail: row.accountEmail,
  lastSyncAt: row.lastSyncAt,
  lastError: row.lastError,
  connectedAt: row.connectedAt,
  revokedAt: row.revokedAt,
});

export class PrismaCalendarIntegrationRepository implements CalendarIntegrationRepository {
  async findActiveByUserId(userId: string): Promise<CalendarIntegrationRecord | null> {
    const row = await prisma.calendarIntegration.findFirst({
      where: { userId, revokedAt: null },
    });
    return row ? mapRow(row) : null;
  }

  async upsert(userId: string, input: UpsertCalendarIntegrationInput): Promise<CalendarIntegrationRecord> {
    const row = await prisma.calendarIntegration.upsert({
      where: { userId },
      create: {
        userId,
        provider: input.provider,
        accessToken: input.accessToken,
        refreshToken: input.refreshToken,
        tokenExpiry: input.tokenExpiry,
        calendarId: input.calendarId,
        scope: input.scope ?? null,
        accountEmail: input.accountEmail ?? null,
        lastSyncAt: input.lastSyncAt ?? null,
        lastError: input.lastError ?? null,
        revokedAt: null,
      },
      update: {
        provider: input.provider,
        accessToken: input.accessToken,
        refreshToken: input.refreshToken,
        tokenExpiry: input.tokenExpiry,
        calendarId: input.calendarId,
        scope: input.scope ?? null,
        accountEmail: input.accountEmail ?? null,
        lastSyncAt: input.lastSyncAt ?? null,
        lastError: input.lastError ?? null,
        revokedAt: null,
        connectedAt: new Date(),
      },
    });

    return mapRow(row);
  }

  async revoke(userId: string): Promise<void> {
    await prisma.calendarIntegration.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async updateTokens(userId: string, accessToken: string, tokenExpiry: Date | null): Promise<void> {
    await prisma.calendarIntegration.updateMany({
      where: { userId, revokedAt: null },
      data: {
        accessToken: encryptToken(accessToken),
        tokenExpiry,
      },
    });
  }

  async updateSyncStatus(userId: string, lastSyncAt: Date | null, lastError: string | null): Promise<void> {
    await prisma.calendarIntegration.updateMany({
      where: { userId, revokedAt: null },
      data: { lastSyncAt, lastError },
    });
  }
}

export const prismaCalendarIntegrationRepository = new PrismaCalendarIntegrationRepository();
