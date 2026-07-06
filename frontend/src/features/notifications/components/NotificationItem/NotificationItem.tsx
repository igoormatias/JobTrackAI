"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Eye, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ACTION_LABELS, openOriginalJobLabel } from "@/constants/action-labels";
import { openJobUrl } from "@/lib/jobs/open-job-url";
import type { Notification, NotificationCategory } from "@/types";

const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  jobs: "Novas vagas",
  pipeline: "Pipeline",
  calendar: "Calendário",
  system: "Sistema",
};

export type NotificationItemProps = {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
};

export const NotificationItem = ({ notification, onMarkRead, onDelete }: NotificationItemProps) => {
  const router = useRouter();
  const jobId = typeof notification.metadata.jobId === "string" ? notification.metadata.jobId : null;
  const sourceUrl =
    typeof notification.metadata.sourceUrl === "string" ? notification.metadata.sourceUrl : null;
  const source =
    typeof notification.metadata.source === "string" ? notification.metadata.source : null;

  const handleOpen = () => {
    if (!notification.read) onMarkRead(notification.id);
    if (notification.actionUrl) router.push(notification.actionUrl);
  };

  return (
    <article
      className={`rounded-lg border border-border p-4 ${notification.read ? "bg-card" : "bg-primary/5"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-[10px]">
              {CATEGORY_LABELS[notification.category]}
            </Badge>
            {!notification.read ? <Badge className="text-[10px]">Nova</Badge> : null}
          </div>
          <button type="button" className="text-left" onClick={handleOpen}>
            <h3 className="break-words text-sm font-semibold text-foreground">{notification.title}</h3>
            {notification.message ? (
              <p className="mt-1 break-words text-sm text-muted-foreground">{notification.message}</p>
            ) : null}
          </button>
          <p className="text-xs text-muted-foreground">
            {new Date(notification.createdAt).toLocaleString("pt-BR")}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Remover notificação"
          onClick={() => onDelete(notification.id)}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {notification.type === "new_job" && jobId ? (
          <>
            <Button type="button" variant="outline" size="sm" asChild>
              <Link href={`/jobs/${jobId}`}>
                <Eye className="size-3.5" aria-hidden />
                {ACTION_LABELS.viewJobDescription}
              </Link>
            </Button>
            {sourceUrl ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => openJobUrl({ sourceUrl, status: "active" })}
              >
                <ExternalLink className="size-3.5" aria-hidden />
                {openOriginalJobLabel(source)}
              </Button>
            ) : null}
            <Button type="button" size="sm" asChild>
              <Link href={`/jobs/${jobId}`}>
                <Plus className="size-3.5" aria-hidden />
                {ACTION_LABELS.addToPipeline}
              </Link>
            </Button>
          </>
        ) : notification.actionUrl ? (
          <Button type="button" variant="outline" size="sm" onClick={handleOpen}>
            {notification.category === "pipeline"
              ? ACTION_LABELS.openProcess
              : ACTION_LABELS.viewCalendar}
          </Button>
        ) : null}
      </div>
    </article>
  );
};
