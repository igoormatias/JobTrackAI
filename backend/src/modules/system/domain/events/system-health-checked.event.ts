import { DomainEvent } from "../../../../shared/domain/domain-event.js";

export class SystemHealthCheckedEvent extends DomainEvent {
  readonly eventName = "SystemHealthChecked";

  constructor(
    readonly payload: {
      status: string;
      version: string;
      uptime: number;
    },
  ) {
    super();
  }
}
