import { AppError } from "../../../../shared/errors/app-error.js";

export class CalendarConnectionError extends AppError {
  constructor(message = "Não foi possível validar a conexão com o Google Calendar.") {
    super(message, 422, "CALENDAR_CONNECTION_ERROR");
  }
}
