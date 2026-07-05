import { AppError } from "../../../../shared/errors/app-error.js";

export class CalendarOAuthError extends AppError {
  constructor(message = "Falha na autenticação com o Google Calendar.", statusCode = 502) {
    super(message, statusCode, "CALENDAR_OAUTH_ERROR");
  }
}
