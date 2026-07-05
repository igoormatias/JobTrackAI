import { apiClient } from "@/lib/api-client";
import type { Application, Job, JobPriority, JobVisibility, PipelineStage, TimelineEvent } from "@/types";

export type JobTracking = Application & {
  isFavorite: boolean;
  priority: JobPriority;
  visibility: JobVisibility;
  hiddenAt?: string | null;
};

export type CreateTrackingFromJobPayload = {
  jobId: string;
  stage: PipelineStage;
  stageOccurredAt: string;
  notes?: string | null;
};

export type CreateManualTrackingPayload = {
  job: {
    companyName: string;
    title: string;
    sourceUrl?: string | null;
    description?: string | null;
    source: Job["source"] | "referral" | "recruiter" | "company_site" | "other";
    area?: string;
    modality?: string;
    location?: string;
  };
  stage: PipelineStage;
  stageOccurredAt: string;
  notes?: string | null;
};

export type MoveTrackingStagePayload = {
  stage: PipelineStage;
  occurredAt: string;
};

export type TrackingDetail = JobTracking & {
  feedback: string | null;
  recruiterName: string | null;
  recruiterEmail: string | null;
  recruiterPhone: string | null;
  negotiatedSalary: number | null;
  processLinks: Record<string, string> | null;
  aiAnalysisStatus: string;
  aiAnalyzedAt: string | null;
  stage: PipelineStage;
  timeline: TimelineEvent[];
};

export type UpdateProcessPayload = {
  notes?: string | null;
  feedback?: string | null;
  priority?: JobPriority;
  isFavorite?: boolean;
  recruiterName?: string | null;
  recruiterEmail?: string | null;
  recruiterPhone?: string | null;
  negotiatedSalary?: number | null;
  processLinks?: Record<string, string> | null;
};

export const getTrackingById = async (id: string): Promise<TrackingDetail> => {
  const response = await apiClient.get<{ data: TrackingDetail }>(`/tracking/${id}`);
  return response.data.data;
};

export const listTracking = async (): Promise<JobTracking[]> => {
  const response = await apiClient.get<{ data: JobTracking[] }>("/tracking");
  return response.data.data;
};

export const updateTrackingProcess = async (
  id: string,
  payload: UpdateProcessPayload,
): Promise<TrackingDetail> => {
  const response = await apiClient.patch<{ data: TrackingDetail }>(`/tracking/${id}/process`, payload);
  return response.data.data;
};

export const createTracking = async (
  payload: CreateTrackingFromJobPayload | CreateManualTrackingPayload,
): Promise<JobTracking> => {
  const response = await apiClient.post<{ data: JobTracking }>("/tracking", payload);
  return response.data.data;
};

export const moveTrackingStage = async (
  id: string,
  payload: MoveTrackingStagePayload,
): Promise<JobTracking> => {
  const response = await apiClient.patch<{ data: JobTracking }>(`/tracking/${id}/stage`, payload);
  return response.data.data;
};

export const toggleTrackingFavorite = async (id: string): Promise<JobTracking> => {
  const response = await apiClient.patch<{ data: JobTracking }>(`/tracking/${id}/favorite`);
  return response.data.data;
};

export const updateTrackingPriority = async (id: string, priority: JobPriority): Promise<JobTracking> => {
  const response = await apiClient.patch<{ data: JobTracking }>(`/tracking/${id}/priority`, { priority });
  return response.data.data;
};

export const updateTrackingVisibility = async (
  id: string,
  visibility: JobVisibility,
): Promise<JobTracking> => {
  const response = await apiClient.patch<{ data: JobTracking }>(`/tracking/${id}/visibility`, { visibility });
  return response.data.data;
};

export const updateTrackingNotes = async (id: string, notes: string | null): Promise<JobTracking> => {
  const response = await apiClient.patch<{ data: JobTracking }>(`/tracking/${id}/notes`, { notes });
  return response.data.data;
};

export const getTrackingTimeline = async (id: string): Promise<TimelineEvent[]> => {
  const response = await apiClient.get<{ data: TimelineEvent[] }>(`/tracking/${id}/timeline`);
  return response.data.data;
};

export type TrackingInterview = {
  id: string;
  trackingId: string;
  scheduledAt: string;
  link: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateInterviewPayload = {
  scheduledAt: string;
  link?: string | null;
  notes?: string | null;
};

export type UpdateInterviewPayload = {
  scheduledAt?: string;
  link?: string | null;
  notes?: string | null;
};

export const listInterviews = async (trackingId: string): Promise<TrackingInterview[]> => {
  const response = await apiClient.get<{ data: TrackingInterview[] }>(`/tracking/${trackingId}/interviews`);
  return response.data.data;
};

export const createInterview = async (
  trackingId: string,
  payload: CreateInterviewPayload,
): Promise<TrackingInterview> => {
  const response = await apiClient.post<{ data: TrackingInterview }>(`/tracking/${trackingId}/interviews`, payload);
  return response.data.data;
};

export const updateInterview = async (
  trackingId: string,
  interviewId: string,
  payload: UpdateInterviewPayload,
): Promise<TrackingInterview> => {
  const response = await apiClient.patch<{ data: TrackingInterview }>(
    `/tracking/${trackingId}/interviews/${interviewId}`,
    payload,
  );
  return response.data.data;
};

export const updateTimelineEvent = async (
  trackingId: string,
  eventId: string,
  payload: { occurredAt?: string; notes?: string | null },
): Promise<TimelineEvent> => {
  const response = await apiClient.patch<{ data: TimelineEvent }>(
    `/tracking/${trackingId}/timeline/${eventId}`,
    payload,
  );
  return response.data.data;
};
