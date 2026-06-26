import { apiClient } from "@/lib/api-client";
import type { Company, CompanyListParams, CursorPaginatedResponse } from "@/types";

export const listCompanies = async (
  params?: CompanyListParams,
): Promise<CursorPaginatedResponse<Company>> => {
  const { data } = await apiClient.get<CursorPaginatedResponse<Company>>("/companies", { params });
  return data;
};
