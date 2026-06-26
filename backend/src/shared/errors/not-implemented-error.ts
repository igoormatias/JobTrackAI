import { AppError } from "./app-error.js";

export class NotImplementedError extends AppError {
  constructor(message = "Not implemented") {
    super(message, 501, "NOT_IMPLEMENTED");
  }
}
