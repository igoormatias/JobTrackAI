"use client";

import { isThisWeek, isToday, isYesterday } from "date-fns";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/feedback/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { Skeleton } from "@/components/feedback/Skeleton";
import { Button } from "@/components/ui/Button";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import type { Notification, NotificationCategory } from "@/types";

import { NotificationCategoryTabs } from "../NotificationCategoryTabs";
import { NotificationItem } from "../NotificationItem";
import {
  useDeleteNotification,
  useMarkNotificationsRead,
  useNotifications,
} from "../../hooks/use-notifications";

const groupLabel = (date: Date): string => {
  if (isToday(date)) return "Hoje";
  if (isYesterday(date)) return "Ontem";
  if (isThisWeek(date, { weekStartsOn: 1 })) return "Esta semana";
  return "Anteriores";
};

const groupNotifications = (notifications: Notification[]) => {
  const groups = new Map<string, Notification[]>();
  for (const notification of notifications) {
    const label = groupLabel(new Date(notification.createdAt));
    const existing = groups.get(label) ?? [];
    existing.push(notification);
    groups.set(label, existing);
  }
  return Array.from(groups.entries());
};

export const NotificationInboxPage = () => {
  const [category, setCategory] = useState<NotificationCategory | "all">("all");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data, isLoading } = useNotifications({
    limit: 50,
    category: category === "all" ? undefined : category,
    q: debouncedSearch || undefined,
  });
  const markReadMutation = useMarkNotificationsRead();
  const deleteMutation = useDeleteNotification();

  const notifications = useMemo(() => data?.data ?? [], [data]);

  const unreadByCategory = useMemo(() => {
    const counts: Partial<Record<NotificationCategory | "all", number>> = {
      all: notifications.filter((item) => !item.read).length,
    };
    for (const item of notifications) {
      if (item.read) continue;
      counts[item.category] = (counts[item.category] ?? 0) + 1;
    }
    return counts;
  }, [notifications]);

  const grouped = useMemo(() => groupNotifications(notifications), [notifications]);

  const handleMarkAllRead = () => {
    markReadMutation.mutate({ all: true });
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 pb-24">
      <PageHeader
        title="Notificações"
        description="Central inteligente de acompanhamento da carreira: vagas, pipeline, follow-ups e sync."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={markReadMutation.isPending || unreadByCategory.all === 0}
              onClick={handleMarkAllRead}
            >
              Marcar todas como lidas
            </Button>
            {category !== "all" ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={
                  markReadMutation.isPending ||
                  notifications.filter((item) => !item.read).length === 0
                }
                onClick={() => {
                  const ids = notifications.filter((item) => !item.read).map((item) => item.id);
                  if (ids.length === 0) return;
                  markReadMutation.mutate({ ids });
                }}
              >
                Marcar categoria como lida
              </Button>
            ) : null}
          </div>
        }
      />

      <SearchInput
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        onClear={() => setSearch("")}
        placeholder="Buscar notificações..."
        aria-label="Buscar notificações"
      />

      <NotificationCategoryTabs value={category} counts={unreadByCategory} onChange={setCategory} />

      {isLoading ? (
        <div className="space-y-3" aria-busy="true">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          title="Nenhuma notificação"
          description="Quando houver novidades sobre vagas ou processos, elas aparecerão aqui."
        />
      ) : (
        <div className="space-y-6">
          {grouped.map(([label, items]) => (
            <section key={label} className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground">{label}</h2>
              <div className="space-y-3">
                {items.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={(id) => markReadMutation.mutate({ ids: [id] })}
                    onDelete={(id) => deleteMutation.mutate(id)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};
