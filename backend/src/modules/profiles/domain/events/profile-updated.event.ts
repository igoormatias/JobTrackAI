import { DomainEvent } from "../../../../shared/domain/domain-event.js";
import type { Profile } from "../entities/profile.entity.js";

export class ProfileUpdatedEvent extends DomainEvent {
  readonly eventName = "ProfileUpdated";

  constructor(
    readonly payload: {
      userId: string;
      profile: Profile;
    },
  ) {
    super();
  }
}
