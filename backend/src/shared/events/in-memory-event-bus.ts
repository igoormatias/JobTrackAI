import { logger } from "../../config/logger.js";
import type { DomainEvent } from "../domain/domain-event.js";

import type { EventBus, EventHandler } from "./event-bus.interface.js";

export class InMemoryEventBus implements EventBus {
  private readonly handlers = new Map<string, EventHandler[]>();

  subscribe(eventName: string, handler: EventHandler): void {
    const existing = this.handlers.get(eventName) ?? [];
    this.handlers.set(eventName, [...existing, handler]);
  }

  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventName) ?? [];

    await Promise.all(
      handlers.map(async (handler) => {
        try {
          await handler(event);
        } catch (error) {
          logger.error(
            { eventName: event.eventName, error },
            "Event handler failed",
          );
        }
      }),
    );
  }
}
