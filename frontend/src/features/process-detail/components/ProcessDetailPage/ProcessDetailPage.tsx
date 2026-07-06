"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { EmptyState } from "@/components/feedback/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { CareerAnalysisCard } from "@/features/ai/components/CareerAnalysisCard";
import { ACTION_LABELS } from "@/constants/action-labels";
import { OpenOriginalJobButton, JobAvailableSources } from "@/features/jobs/components/JobAvailableSources";
import { formatModality } from "@/features/jobs/utils/job-formatters";
import { PIPELINE_STAGE_LABELS } from "@/features/pipeline/constants/pipeline-columns";
import { PipelineApplicationTimeline } from "@/features/pipeline/components/PipelineApplicationTimeline";
import { EditProcessModal } from "@/features/process-detail/components/EditProcessModal";
import { ChangeStageSheet } from "@/features/tracking/components/ChangeStageSheet";
import { DeleteProcessDialog } from "@/features/tracking/components/DeleteProcessDialog";
import { ScheduleInterviewDialog } from "@/features/tracking/components/ScheduleInterviewDialog";
import { StageDateConfirmDialog } from "@/features/tracking/components/StageDateConfirmDialog/StageDateConfirmDialog";
import { useTrackingByIdQuery } from "@/features/tracking/hooks/use-tracking-by-id-query";
import { useTrackingInterviewsQuery } from "@/features/tracking/hooks/use-tracking-interviews-query";
import {
  useMoveTrackingStageMutation,
  useUpdateTrackingProcessMutation,
} from "@/features/tracking/hooks/use-tracking-mutations/use-tracking-mutations";
import { createInterview } from "@/features/tracking/services/tracking-service";
import { invalidateCareerSurfaces } from "@/lib/query-client/invalidate-career-surfaces";
import type { Application, JobPriority, PipelineStage, TimelineEvent, TimelineEventType } from "@/types";

import { useDeleteApplicationMutation } from "@/features/pipeline/hooks/use-pipeline-mutations";

import { PROCESS_DETAIL_LAYOUT } from "../../constants/process-detail-layout";

type ApiTimelineEvent = {
  id: string;
  type: TimelineEventType;
  title: string;
  occurredAt: string;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
};

const PRIORITY_LABELS: Record<JobPriority, string> = {
  HIGH: "Alta",
  MEDIUM: "Média",
  LOW: "Baixa",
};

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);

const formatSalaryRange = (min?: number | null, max?: number | null): string | null => {
  if (min == null && max == null) return null;
  if (min != null && max != null) return `${formatCurrency(min)} – ${formatCurrency(max)}`;
  if (min != null) return `A partir de ${formatCurrency(min)}`;
  return `Até ${formatCurrency(max!)}`;
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

export type ProcessDetailPageProps = {
  trackingId: string;
};

export const ProcessDetailPage = ({ trackingId }: ProcessDetailPageProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { data: tracking, isLoading, isError } = useTrackingByIdQuery(trackingId);
  const { data: interviews = [] } = useTrackingInterviewsQuery(trackingId);
  const updateProcessMutation = useUpdateTrackingProcessMutation();
  const moveStageMutation = useMoveTrackingStageMutation();
  const [editOpen, setEditOpen] = useState(false);
  const [stageSheetOpen, setStageSheetOpen] = useState(false);
  const [pendingStage, setPendingStage] = useState<PipelineStage | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteMutation = useDeleteApplicationMutation();

  const scheduleInterviewMutation = useMutation({
    mutationFn: (values: { scheduledAt: string; link?: string | null; notes?: string | null }) =>
      createInterview(trackingId, values),
    onSuccess: async () => {
      invalidateCareerSurfaces(queryClient);
      toast.success("Entrevista agendada");
      setScheduleOpen(false);
    },
    onError: () => toast.error("Não foi possível agendar a entrevista"),
  });

  useEffect(() => {
    if (searchParams.get("edit") === "1") setEditOpen(true);
  }, [searchParams]);

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
  const jobSalary = formatSalaryRange(tracking.job.salaryMin, tracking.job.salaryMax);
  const processLinks = tracking.processLinks ? Object.entries(tracking.processLinks) : [];
  const hasRecruiter =
    tracking.recruiterName ||
    tracking.recruiterRole ||
    tracking.recruiterEmail ||
    tracking.recruiterPhone ||
    tracking.recruiterLinkedin;
  const hasCompensation = tracking.negotiatedSalary != null || tracking.salaryExpectation != null;

  const interviewApplication: Application | null = scheduleOpen
    ? {
        id: tracking.id,
        jobId: tracking.jobId,
        companyId: tracking.companyId,
        userId: tracking.userId,
        stage: tracking.stage,
        status: tracking.status,
        notes: tracking.notes,
        nextStep: tracking.nextStep ?? null,
        nextInterviewAt: tracking.nextInterviewAt ?? null,
        job: tracking.job,
        timeline: tracking.timeline,
        appliedAt: tracking.appliedAt,
        updatedAt: tracking.updatedAt,
        lastStageUpdatedAt: tracking.lastStageUpdatedAt,
      }
    : null;

  const handleStageSelect = (stage: PipelineStage) => {
    if (stage === tracking.stage) return;
    setPendingStage(stage);
  };

  const confirmStageMove = (occurredAt: string) => {
    if (!pendingStage) return;
    moveStageMutation.mutate(
      { id: tracking.id, stage: pendingStage, occurredAt },
      { onSettled: () => setPendingStage(null) },
    );
  };

  return (
    <div className={`${PROCESS_DETAIL_LAYOUT.page} min-w-0`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link href="/pipeline" className="text-sm text-muted-foreground hover:text-foreground">
            ← Pipeline
          </Link>
          <h1 className="mt-2 break-words text-2xl font-bold text-foreground">{tracking.job.title}</h1>
          <p className="text-muted-foreground">{tracking.job.company.name}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setStageSheetOpen(true)}>
            {ACTION_LABELS.updateStage}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            {ACTION_LABELS.editProcess}
          </Button>
          <Link href={`/jobs/${tracking.job.id}`}>
            <Button variant="outline" size="sm">
              {ACTION_LABELS.viewJobDescription}
            </Button>
          </Link>
          <OpenOriginalJobButton job={tracking.job} size="sm" variant="outline" />
          <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
            {ACTION_LABELS.deleteProcess}
          </Button>
        </div>
      </div>

      <div className={PROCESS_DETAIL_LAYOUT.grid}>
        <div className={`${PROCESS_DETAIL_LAYOUT.main} min-w-0 space-y-4`}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informações da vaga</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">Empresa:</span> {tracking.job.company.name}
              </p>
              <p>
                <span className="font-medium text-foreground">Cargo:</span> {tracking.job.title}
              </p>
              <JobAvailableSources job={tracking.job} />
              {tracking.job.location ? (
                <p>
                  <span className="font-medium text-foreground">Localização:</span> {tracking.job.location}
                </p>
              ) : null}
              <p>
                <span className="font-medium text-foreground">Modalidade:</span>{" "}
                {formatModality(tracking.job.modality)}
              </p>
              {jobSalary ? (
                <p>
                  <span className="font-medium text-foreground">Salário publicado:</span> {jobSalary}
                </p>
              ) : null}
              {tracking.job.technologies?.length ? (
                <div className="flex flex-wrap gap-1 pt-1">
                  {tracking.job.technologies.map((tech) => (
                    <Chip key={tech.id}>{tech.name}</Chip>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Processo</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2 text-sm">
              <Badge variant="outline">{PIPELINE_STAGE_LABELS[tracking.stage]}</Badge>
              <Badge variant="secondary">Prioridade: {PRIORITY_LABELS[tracking.priority]}</Badge>
              {tracking.isFavorite ? <Badge className="bg-amber-500/15 text-amber-700">Favorita</Badge> : null}
              <p className="w-full text-xs text-muted-foreground">
                Criado em {format(new Date(tracking.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                {tracking.lastStageUpdatedAt
                  ? ` · Última atualização de status ${format(new Date(tracking.lastStageUpdatedAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}`
                  : null}
              </p>
            </CardContent>
          </Card>

          {hasRecruiter ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recrutadora</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 break-words text-sm text-muted-foreground">
                {tracking.recruiterName ? <p>{tracking.recruiterName}</p> : null}
                {tracking.recruiterRole ? <p>{tracking.recruiterRole}</p> : null}
                {tracking.recruiterEmail ? <p>{tracking.recruiterEmail}</p> : null}
                {tracking.recruiterPhone ? <p>{tracking.recruiterPhone}</p> : null}
                {tracking.recruiterLinkedin ? (
                  <a
                    href={tracking.recruiterLinkedin}
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    LinkedIn
                  </a>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Entrevistas</CardTitle>
              <Button type="button" size="sm" variant="outline" onClick={() => setScheduleOpen(true)}>
                Agendar
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {interviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma entrevista agendada.</p>
              ) : (
                interviews.map((interview) => (
                  <div key={interview.id} className="rounded-lg border border-border/60 p-3 text-sm">
                    <p className="font-medium text-foreground">
                      {format(new Date(interview.scheduledAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                    {interview.location ? (
                      <p className="text-muted-foreground">Local: {interview.location}</p>
                    ) : null}
                    {interview.meetingType ? (
                      <p className="text-muted-foreground">Modalidade: {interview.meetingType}</p>
                    ) : null}
                    {interview.link ? (
                      <a href={interview.link} className="text-primary hover:underline" target="_blank" rel="noreferrer">
                        Link da entrevista
                      </a>
                    ) : null}
                    {interview.notes ? (
                      <p className="mt-1 break-words text-muted-foreground">{interview.notes}</p>
                    ) : null}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {hasCompensation ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Proposta e pretensão</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-muted-foreground">
                {tracking.negotiatedSalary != null ? (
                  <p>
                    <span className="font-medium text-foreground">Valor da proposta:</span>{" "}
                    {formatCurrency(tracking.negotiatedSalary)}
                  </p>
                ) : null}
                {tracking.salaryExpectation ? (
                  <p>
                    <span className="font-medium text-foreground">Pretensão salarial:</span>{" "}
                    {formatSalaryRange(tracking.salaryExpectation.min, tracking.salaryExpectation.max)}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          {processLinks.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Links do processo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {processLinks.map(([label, url]) => (
                  <div key={label}>
                    <span className="font-medium text-foreground">{label}: </span>
                    <a href={url} className="break-all text-primary hover:underline" target="_blank" rel="noreferrer">
                      {url}
                    </a>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}

          {tracking.tags?.length ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tags</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-1">
                {tracking.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          ) : null}

          {tracking.notes ? (
            <Card className="col-span-full">
              <CardHeader>
                <CardTitle className="text-base">Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="break-words text-sm text-muted-foreground whitespace-pre-wrap">{tracking.notes}</p>
              </CardContent>
            </Card>
          ) : null}

          {tracking.feedback ? (
            <Card className="col-span-full">
              <CardHeader>
                <CardTitle className="text-base">Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="break-words text-sm text-muted-foreground whitespace-pre-wrap">{tracking.feedback}</p>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Histórico</CardTitle>
            </CardHeader>
            <CardContent>
              <PipelineApplicationTimeline
                events={timeline}
                currentStage={tracking.stage}
                variant="embedded"
              />
            </CardContent>
          </Card>
        </div>

        <div className={`${PROCESS_DETAIL_LAYOUT.sidebar} min-w-0 space-y-4`}>
          <CareerAnalysisCard
            trackingId={tracking.id}
            matchScore={tracking.job.matchScore.score}
            aiAnalysisStatus={tracking.aiAnalysisStatus}
            aiAnalyzedAt={tracking.aiAnalyzedAt}
          />
        </div>
      </div>

      <EditProcessModal
        open={editOpen}
        onOpenChange={setEditOpen}
        tracking={tracking}
        isSubmitting={updateProcessMutation.isPending || moveStageMutation.isPending}
        onStageChange={(stage) => {
          moveStageMutation.mutate({
            id: tracking.id,
            stage,
            occurredAt: new Date().toISOString(),
          });
        }}
        onSubmit={(payload) => {
          updateProcessMutation.mutate(
            { id: tracking.id, payload },
            { onSuccess: () => setEditOpen(false) },
          );
        }}
      />

      <ChangeStageSheet
        open={stageSheetOpen}
        onOpenChange={setStageSheetOpen}
        currentStage={tracking.stage}
        onSelectStage={handleStageSelect}
      />

      <StageDateConfirmDialog
        open={pendingStage != null}
        onOpenChange={(open) => {
          if (!open) setPendingStage(null);
        }}
        onConfirm={confirmStageMove}
        isPending={moveStageMutation.isPending}
      />

      <ScheduleInterviewDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        application={interviewApplication}
        isPending={scheduleInterviewMutation.isPending}
        onSubmit={(values) => scheduleInterviewMutation.mutate(values)}
      />

      <DeleteProcessDialog
        application={{ id: tracking.id, job: tracking.job } as Application}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        isPending={deleteMutation.isPending}
        onConfirm={() => {
          deleteMutation.mutate(tracking.id, {
            onSuccess: () => {
              toast.success("Processo excluído");
              router.push("/pipeline");
            },
            onError: () => toast.error("Não foi possível excluir o processo"),
          });
        }}
      />
    </div>
  );
};
