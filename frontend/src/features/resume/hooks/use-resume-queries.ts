import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  analyzeResumeJob,
  applyResumeSuggestion,
  fetchResume,
  fetchResumeHistory,
  fetchResumeVersions,
  importResumeText,
  rejectResumeSuggestion,
  restoreResumeVersion,
  updateResume,
  uploadResumeFile,
  type ResumeStructuredContent,
} from "../services/resume-service";

export const resumeKeys = {
  all: ["resume"] as const,
  detail: () => [...resumeKeys.all, "detail"] as const,
  versions: () => [...resumeKeys.all, "versions"] as const,
  history: () => [...resumeKeys.all, "history"] as const,
};

export const useResumeQuery = () =>
  useQuery({
    queryKey: resumeKeys.detail(),
    queryFn: fetchResume,
  });

export const useResumeVersionsQuery = () =>
  useQuery({
    queryKey: resumeKeys.versions(),
    queryFn: fetchResumeVersions,
  });

export const useResumeHistoryQuery = () =>
  useQuery({
    queryKey: resumeKeys.history(),
    queryFn: fetchResumeHistory,
  });

export const useUpdateResumeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: ResumeStructuredContent) => updateResume(content),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: resumeKeys.all });
    },
  });
};

export const useUploadResumeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadResumeFile,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: resumeKeys.all });
    },
  });
};

export const useImportResumeTextMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: importResumeText,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: resumeKeys.all });
    },
  });
};

export const useRestoreVersionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: restoreResumeVersion,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: resumeKeys.all });
    },
  });
};

export const useAnalyzeJobMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: analyzeResumeJob,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: resumeKeys.history() });
    },
  });
};

export const useApplySuggestionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, editedText }: { id: string; editedText?: string }) =>
      applyResumeSuggestion(id, editedText),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: resumeKeys.all });
    },
  });
};

export const useRejectSuggestionMutation = () => {
  return useMutation({
    mutationFn: rejectResumeSuggestion,
  });
};
