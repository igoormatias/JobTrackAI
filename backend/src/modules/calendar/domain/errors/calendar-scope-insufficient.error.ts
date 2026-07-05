import { AppError } from "../../../../shared/errors/app-error.js";

export class CalendarScopeInsufficientError extends AppError {
  constructor(message = "O Google não concedeu permissão para gerenciar eventos do calendário. Tente conectar novamente.") {
    super(message, 422, "CALENDAR_SCOPE_INSUFFICIENT");
  }
}
