import { logger } from "../../../../config/logger.js";

export type CalendarOAuthLogContext = {
  userId: string;
  requestedScopes?: readonly string[];
  receivedScopes?: string | null;
  hasRefreshToken?: boolean;
  tokenExpiry?: Date | null;
  calendarId?: string | null;
  durationMs?: number;
  googleErrorReason?: string;
  accessToken?: string;
  action: string;
};

export const logCalendarOAuth = (context: CalendarOAuthLogContext): void => {
  logger.info(
    {
      calendar: {
        action: context.action,
        userId: context.userId,
        requestedScopes: context.requestedScopes,
        receivedScopes: context.receivedScopes,
        hasRefreshToken: context.hasRefreshToken,
        tokenExpiry: context.tokenExpiry?.toISOString() ?? null,
        calendarId: context.calendarId,
        durationMs: context.durationMs,
        googleErrorReason: context.googleErrorReason,
        accessTokenPrefix: context.accessToken?.slice(0, 6) ?? null,
      },
    },
    "calendar.oauth",
  );
};
