import { http, HttpResponse } from "msw";

import type { Company, CompanyListParams, CursorPaginatedResponse } from "@/types";

import { getFixtureStore } from "../fixtures";
import { getPrioritizedCompanies } from "../utils/smart-mock-context";
import { paginateWithCursor } from "../utils/pagination";

const parseCompanyListParams = (searchParams: URLSearchParams): CompanyListParams => ({
  cursor: searchParams.get("cursor") ?? undefined,
  limit: Number(searchParams.get("limit") ?? 20) || 20,
  q: searchParams.get("q") ?? undefined,
});

export const companiesHandlers = [
  http.get("*/companies", ({ request }) => {
    const store = getFixtureStore();
    const params = parseCompanyListParams(new URL(request.url).searchParams);

    let companies = getPrioritizedCompanies(store.companies);

    if (params.q) {
      const query = params.q.toLowerCase();
      companies = companies.filter(
        (company) =>
          company.name.toLowerCase().includes(query) ||
          company.industry.toLowerCase().includes(query) ||
          company.location.toLowerCase().includes(query),
      );
    }

    const response = paginateWithCursor(companies, {
      cursor: params.cursor,
      limit: params.limit,
      getId: (company) => company.id,
      getSortValue: (company: Company) => company.name,
    });

    return HttpResponse.json<CursorPaginatedResponse<Company>>(response);
  }),
];
