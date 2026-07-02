import { describe, expect, it, vi } from "vitest";

import { DomainEvent } from "../domain/domain-event.js";

import { InMemoryEventBus } from "./in-memory-event-bus.js";

class TestEvent extends DomainEvent {
  readonly eventName = "TestEvent";

  constructor(readonly payload: string) {
    super();
  }
}

describe("InMemoryEventBus", () => {
  it("should call subscribed handlers on publish", async () => {
    const bus = new InMemoryEventBus();
    const handler = vi.fn().mockResolvedValue(undefined);

    bus.subscribe("TestEvent", handler);
    const event = new TestEvent("hello");

    await bus.publish(event);

    expect(handler).toHaveBeenCalledWith(event);
  });

  it("should call multiple handlers for the same event", async () => {
    const bus = new InMemoryEventBus();
    const handlerA = vi.fn().mockResolvedValue(undefined);
    const handlerB = vi.fn().mockResolvedValue(undefined);

    bus.subscribe("TestEvent", handlerA);
    bus.subscribe("TestEvent", handlerB);

    await bus.publish(new TestEvent("multi"));

    expect(handlerA).toHaveBeenCalledTimes(1);
    expect(handlerB).toHaveBeenCalledTimes(1);
  });

  it("should not throw when a handler fails", async () => {
    const bus = new InMemoryEventBus();
    const failingHandler = vi.fn().mockRejectedValue(new Error("handler error"));
    const successHandler = vi.fn().mockResolvedValue(undefined);

    bus.subscribe("TestEvent", failingHandler);
    bus.subscribe("TestEvent", successHandler);

    await expect(bus.publish(new TestEvent("fail"))).resolves.toBeUndefined();
    expect(successHandler).toHaveBeenCalledTimes(1);
  });
});
