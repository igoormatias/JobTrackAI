/**
 * @deprecated Use `modules/system` instead. This module is kept for backward compatibility.
 * Routes are now served by the `system` module via `createSystemRoutes()`.
 */
export { createSystemRoutes as createHealthRoutes } from "../system/infrastructure/http/routes/system.routes.js";
export { GetHealthUseCase as HealthService } from "../system/application/use-cases/get-health.use-case.js";
export type { HealthResponseDto } from "../system/application/dto/health-response.dto.js";
