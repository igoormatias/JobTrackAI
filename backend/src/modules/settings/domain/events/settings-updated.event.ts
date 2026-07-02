import { DomainEvent } from "../../../../shared/domain/domain-event.js";
import type { UserSettingsEntity } from "../entities/user-settings.entity.js";

export class SettingsUpdatedEvent extends DomainEvent {
  readonly eventName = "SettingsUpdated";

  constructor(
    readonly payload: {
      userId: string;
      settings: UserSettingsEntity;
    },
  ) {
    super();
  }
}
