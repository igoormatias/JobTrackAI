"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { CareerAnalysisCard } from "@/features/ai/components/CareerAnalysisCard";
import { PIPELINE_STAGE_LABELS } from "@/features/pipeline/constants/pipeline-columns";
import { PipelineApplicationTimeline } from "@/features/pipeline/components/PipelineApplicationTimeline";
import { MatchScoreBadge } from "@/features/recommendations/components/MatchScoreBadge";
import { EditProcessModal } from "@/features/process-detail/components/EditProcessModal";
import { useTrackingByIdQuery } from "@/features/tracking/hooks/use-tracking-by-id-query";
import { useUpdateTrackingProcessMutation } from "@/features/tracking/hooks/use-tracking-mutations/use-tracking-mutations";
import { openJobUrl } from "@/lib/jobs/open-job-url";
import type { TimelineEvent, TimelineEventType } from "@/types";

import { PROCESS_DETAIL_LAYOUT } from "../../constants/process-detail-layout";

type ApiTimelineEvent = {
  id: string;
  type: TimelineEventType;
  title: string;
  occurredAt: string;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
};

const mapTimeline = (trackingId: string, events: ApiTimelineEvent[]): TimelineEvent[] =>
  events.map((event) => ({
    id: event.id,
    applicationId: trackingId,
    type: event.type,
    title: event.title,
    description: event.notes ?? null,
    metadata: (event.metadata as TimelineEvent["metadata"]) ?? {},
    occurredAt: event.occurredAt,
  }));

export const ProcessDetailPage = () => {
  const params = useParams<{ trackingId: string }>();
  const trackingId = params.trackingId;
  const { data: tracking, isLoading, isError } = useTrackingByIdQuery(trackingId);
  const updateProcessMutation = useUpdateTrackingProcessMutation();
  const [editOpen, setEditOpen] = useState(false);

  if (isLoading) {
    return <p className="py-12 text-center text-muted-foreground">Carregando processo…</p>;
  }

  if (isError || !tracking) {
    return (
      <EmptyState
        title="Processo não encontrado"
        description="Não foi possível carregar os detalhes deste processo."
        action={
          <Link href="/pipeline">
            <Button variant="outline">Voltar ao pipeline</Button>
          </Link>
        }
      />
    );
  }

  const timeline = mapTimeline(tracking.id, tracking.timeline as ApiTimelineEvent[]);

  return (
    <div className={PROCESS_DETAIL_LAYOUT.page}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/pipeline" className="text-sm text-muted-foreground hover:text-foreground">
            ← Pipeline
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-foreground">{tracking.job.title}</h1>
          <p className="text-muted-foreground">{tracking.job.company.name}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            Editar processo
          </Button>
          {tracking.job.sourceUrl ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => openJobUrl({ sourceUrl: tracking.job.sourceUrl, status: tracking.job.status })}
            >
              Abrir vaga
            </Button>
          ) : null}
        </div>
      </div>

      <div className={PROCESS_DETAIL_LAYOUT.grid}>
        <div className={PROCESS_DETAIL_LAYOUT.main}>
          <MatchScoreBadge matchScore={tracking.job.matchScore} />
          <Badge variant="outline">{PIPELINE_STAGE_LABELS[tracking.stage]}</Badge>

          {tracking.notes ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{tracking.notes}</p>
              </CardContent>
            </Card>
          ) : null}

          {tracking.feedback ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{tracking.feedback}</p>
              </CardContent>
            </Card>
          ) : null}

          <PipelineApplicationTimeline events={timeline} />
        </div>

        <div className={PROCESS_DETAIL_LAYOUT.sidebar}>
          <CareerAnalysisCard
            trackingId={tracking.id}
            matchScore={tracking.job.matchScore.score}
            aiAnalysisStatus={tracking.aiAnalysisStatus}
            aiAnalyzedAt={tracking.aiAnalyzedAt}
          />

          {tracking.recruiterName || tracking.recruiterEmail || tracking.recruiterPhone ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recrutador(a)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-muted-foreground">
                {tracking.recruiterName ? <p>{tracking.recruiterName}</p> : null}
                {tracking.recruiterEmail ? <p>{tracking.recruiterEmail}</p> : null}
                {tracking.recruiterPhone ? <p>{tracking.recruiterPhone}</p> : null}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>

      <EditProcessModal
        open={editOpen}
        onOpenChange={setEditOpen}
        tracking={tracking}
        isSubmitting={updateProcessMutation.isPending}
        onSubmit={(payload) => {
          updateProcessMutation.mutate(
            { id: tracking.id, payload },
            { onSuccess: () => setEditOpen(false) },
          );
        }}
      />
    </div>
  );
};
