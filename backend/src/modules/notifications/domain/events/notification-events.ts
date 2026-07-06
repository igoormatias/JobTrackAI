import { DomainEvent } from "../../../../shared/domain/domain-event.js";

export class NotificationCreatedEvent extends DomainEvent {
  readonly eventName = "notification_created";

  constructor(
    readonly payload: {
      userId: string;
      notificationId: string;
      type: string;
    },
  ) {
    super();
  }
}

export class ProcessCreatedEvent extends DomainEvent {
  readonly eventName = "process_created";

  constructor(
    readonly payload: {
      userId: string;
      trackingId: string;
      jobTitle: string;
      companyName: string;
    },
  ) {
    super();
  }
}

export class StatusChangedEvent extends DomainEvent {
  readonly eventName = "status_changed";

  constructor(
    readonly payload: {
      userId: string;
      trackingId: string;
      jobTitle: string;
      companyName: string;
      fromStage: string;
      toStage: string;
    },
  ) {
    super();
  }
}

export class JobFavoritedEvent extends DomainEvent {
  readonly eventName = "job_favorited";

  constructor(
    readonly payload: {
      userId: string;
      trackingId: string;
      jobTitle: string;
      companyName: string;
      isFavorite: boolean;
    },
  ) {
    super();
  }
}

export class PriorityChangedEvent extends DomainEvent {
  readonly eventName = "priority_changed";

  constructor(
    readonly payload: {
      userId: string;
      trackingId: string;
      jobTitle: string;
      companyName: string;
      priority: string;
    },
  ) {
    super();
  }
}

export class InterviewReminderEvent extends DomainEvent {
  readonly eventName = "interview_reminder";

  constructor(
    readonly payload: {
      userId: string;
      trackingId: string;
      interviewId: string;
      jobTitle: string;
      companyName: string;
      scheduledAt: string;
      reminderKind: "24h" | "30min";
    },
  ) {
    super();
  }
}

export class JobClosedEvent extends DomainEvent {
  readonly eventName = "job_closed";

  constructor(
    readonly payload: {
      userId: string;
      jobId: string;
      trackingId: string;
      jobTitle: string;
      companyName: string;
    },
  ) {
    super();
  }
}
