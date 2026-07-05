import { prisma } from "../../../../database/prisma.js";

export class DismissCalendarPromptUseCase {
  async execute(userId: string): Promise<void> {
    await prisma.userSettings.upsert({
      where: { userId },
      create: {
        userId,
        calendarPromptDismissedAt: new Date(),
      },
      update: {
        calendarPromptDismissedAt: new Date(),
      },
    });
  }
}
