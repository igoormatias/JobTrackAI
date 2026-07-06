/** ApplicationProcess is the product name for JobTracking (ADR-034). */
export const withApplicationProcessResponse = <T>(
  data: T,
  message?: string,
): { data: T; process: T; message?: string } => ({
  data,
  process: data,
  ...(message ? { message } : {}),
});
