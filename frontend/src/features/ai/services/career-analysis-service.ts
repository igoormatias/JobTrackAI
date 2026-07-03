import { isAxiosError } from "axios";

import { apiClient } from "@/lib/api-client";

import type { CareerAnalysisResponse } from "../types/career-analysis.types";

export const getCareerAnalysis = async (trackingId: string): Promise<CareerAnalysisResponse | null> => {
  const response = await apiClient.get<{ data: CareerAnalysisResponse }>(`/ai/career-analysis/${trackingId}`, {
    validateStatus: (status) => status === 200 || status === 204,
  });

  if (response.status === 204) return null;
  return response.data.data;
};

export const generateCareerAnalysis = async (
  trackingId: string,
  refresh = false,
): Promise<CareerAnalysisResponse> => {
  const { data } = await apiClient.post<{ data: CareerAnalysisResponse }>(
    `/ai/career-analysis/${trackingId}`,
    {},
    { params: { refresh } },
  );
  return data.data;
};

export const getCareerAnalysisErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    const code = error.response?.data?.code as string | undefined;
    if (code === "AI_NOT_CONFIGURED") {
      return "Análise IA indisponível no momento. Tente novamente mais tarde.";
    }
    if (code === "AI_RATE_LIMIT_EXCEEDED") {
      return "Limite diário de análises IA atingido. Volte amanhã.";
    }
    if (code === "AI_DEBOUNCE") {
      return "Aguarde alguns segundos antes de gerar outra análise.";
    }
    if (error.response?.status === 404) {
      return "Processo seletivo não encontrado.";
    }
    if (typeof error.response?.data?.message === "string") {
      return error.response.data.message;
    }
  }
  return "Não foi possível gerar a análise IA. Tente novamente.";
};
