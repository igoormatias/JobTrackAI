"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Skeleton } from "@/components/feedback/Skeleton";
import { NotificationBadge } from "@/components/badges/NotificationBadge";
import { Button } from "@/components/ui/Button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import {
  useMarkNotificationsRead,
  useNotifications,
} from "@/features/notifications/hooks/use-notifications";
import type { Notification } from "@/types";

const formatNotificationTime = (value: string): string => {
  const date = new Date(value);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const HeaderNotificationButton = () => {
  const [open, setOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const { data, isLoading } = useNotifications({ limit: 20 });
  const markReadMutation = useMarkNotificationsRead();
  const notifications = data?.data ?? [];
  const unreadCount = notifications.filter((item) => !item.read).length;

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [open]);

  const handleMarkAllRead = () => {
    const unreadIds = notifications.filter((item) => !item.read).map((item) => item.id);
    if (unreadIds.length === 0) return;
    markReadMutation.mutate({ ids: unreadIds });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative cursor-pointer rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label={`Notificações${unreadCount > 0 ? `, ${unreadCount} não lidas` : ""}`}
        >
          <Bell className="h-5 w-5" />
          <NotificationBadge count={unreadCount} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">Notificações</h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={unreadCount === 0 || markReadMutation.isPending}
            onClick={handleMarkAllRead}
          >
            Marcar todas como lidas
          </Button>
        </div>
        <div ref={listRef} className="max-h-80 overflow-y-auto scrollbar-app">
          {isLoading ? (
            <div className="space-y-3 p-4" aria-busy="true" aria-label="Carregando notificações">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">Nenhuma notificação por enquanto.</p>
          ) : (
            <ul className="divide-y divide-border">
              {notifications.map((notification: Notification) => {
                const content = (
                  <>
                    <p className="font-medium">{notification.title}</p>
                    {notification.message ? (
                      <p className="mt-1 text-muted-foreground">{notification.message}</p>
                    ) : null}
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatNotificationTime(notification.createdAt)}
                    </p>
                  </>
                );

                return (
                  <li
                    key={notification.id}
                    className={`px-4 py-3 text-sm ${notification.read ? "text-muted-foreground" : "bg-primary/5 text-foreground"}`}
                  >
                    {notification.actionUrl ? (
                      <Link href={notification.actionUrl} className="block hover:opacity-90">
                        {content}
                      </Link>
                    ) : (
                      content
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
