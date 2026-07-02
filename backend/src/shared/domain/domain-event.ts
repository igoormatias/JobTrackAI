export abstract class DomainEvent {
  readonly occurredAt: Date;

  constructor() {
    this.occurredAt = new Date();
  }

  abstract readonly eventName: string;
}
