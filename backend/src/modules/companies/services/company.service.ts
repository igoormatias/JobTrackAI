import { prisma } from "../../../database/prisma.js";
import { paginateWithCursor } from "../../../shared/http/cursor-pagination.js";
import { parseJobMetadata } from "../../../shared/utils/job-metadata.js";
import type { Company, CompanyListParams, CompanyListResult } from "../types/company.types.js";

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export class CompanyService {
  async listCompanies(params: CompanyListParams = {}): Promise<CompanyListResult> {
    const jobs = await prisma.job.findMany({
      where: { isCatalog: true, status: "active" },
      select: {
        companyName: true,
        companySlug: true,
        location: true,
        metadata: true,
      },
    });

    const companiesMap = new Map<string, Company>();

    for (const job of jobs) {
      const metadata = parseJobMetadata(job.metadata);
      const slug = job.companySlug ?? slugify(job.companyName);
      const key = slug || job.companyName;
      const existing = companiesMap.get(key);

      if (existing) {
        existing.jobCount += 1;
        continue;
      }

      companiesMap.set(key, {
        id: metadata.company?.id ?? `company_${slug}`,
        name: job.companyName,
        slug,
        logoUrl: metadata.company?.logoUrl ?? null,
        website: null,
        industry: metadata.company?.industry ?? "Tecnologia",
        size: "medium",
        location: job.location ?? "",
        jobCount: 1,
      });
    }

    let companies = Array.from(companiesMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name, "pt-BR"),
    );

    if (params.q) {
      const query = params.q.toLowerCase();
      companies = companies.filter(
        (company) =>
          company.name.toLowerCase().includes(query) ||
          company.industry.toLowerCase().includes(query) ||
          company.location.toLowerCase().includes(query),
      );
    }

    return paginateWithCursor(companies, {
      cursor: params.cursor,
      limit: params.limit ?? 20,
      getId: (company) => company.id,
      getSortValue: (company) => company.name,
    });
  }
}

export const companyService = new CompanyService();
