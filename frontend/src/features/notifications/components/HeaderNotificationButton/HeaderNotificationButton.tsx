"use client";

import { Bell } from "lucide-react";

import { NotificationBadge } from "@/components/badges/NotificationBadge";
import { useNotifications } from "@/features/notifications/hooks/use-notifications";

export const HeaderNotificationButton = () => {
  const { data } = useNotifications({ read: false, limit: 50 });
  const unreadCount = data?.data.length ?? 0;

  return (
    <button
      type="button"
      className="relative cursor-pointer rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
      aria-label={`Notificações${unreadCount > 0 ? `, ${unreadCount} não lidas` : ""}`}
    >
      <Bell className="h-5 w-5" />
      <NotificationBadge count={unreadCount} />
    </button>
  );
};
