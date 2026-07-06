import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  CreateProfilePayload,
  ProfessionalArea,
  Profile,
  SalaryRange,
  Seniority,
  UpdateProfilePayload,
  WorkModality,
} from "@/types";

export type JobSearchHints = {
  area: ProfessionalArea | null;
  titleHints: string[];
  skillNames: string[];
  seniority: Seniority | null;
  modality: WorkModality | null;
  location: string | null;
  salaryExpectation: SalaryRange | null;
};

export const getProfile = async (): Promise<Profile> => {
  const { data } = await apiClient.get<ApiResponse<Profile>>("/profile");
  return data.data;
};

export const getJobSearchHints = async (): Promise<JobSearchHints> => {
  const { data } = await apiClient.get<ApiResponse<JobSearchHints>>("/profile/job-search-hints");
  return data.data;
};

export const createProfile = async (payload: CreateProfilePayload): Promise<Profile> => {
  const { data } = await apiClient.post<ApiResponse<Profile>>("/profile", payload);
  return data.data;
};

export const updateProfile = async (payload: UpdateProfilePayload): Promise<Profile> => {
  const { data } = await apiClient.patch<ApiResponse<Profile>>("/profile", payload);
  return data.data;
};
