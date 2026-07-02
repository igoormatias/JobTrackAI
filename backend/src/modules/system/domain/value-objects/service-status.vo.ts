export type ServiceStatusValue = "ok" | "degraded" | "down";

export class ServiceStatus {
  private constructor(private readonly value: ServiceStatusValue) {}

  static ok(): ServiceStatus {
    return new ServiceStatus("ok");
  }

  toString(): ServiceStatusValue {
    return this.value;
  }
}
