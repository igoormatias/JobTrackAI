import { prisma } from "../../../../database/prisma.js";
import type { CreateJobImportInput, JobImportRecord } from "../../domain/entities/job-import.entity.js";
import type { JobImportRepository } from "../../domain/repositories/job-import.repository.js";

const mapImport = (record: {
  id: string;
  executionId: string;
  providerName: string;
  externalId: string | null;
  sourceUrl: string | null;
  contentHash: string | null;
  status: string;
  jobId: string | null;
  errorMessage: string | null;
  createdAt: Date;
}): JobImportRecord => ({
  id: record.id,
  executionId: record.executionId,
  providerName: record.providerName,
  externalId: record.externalId,
  sourceUrl: record.sourceUrl,
  contentHash: record.contentHash,
  status: record.status as JobImportRecord["status"],
  jobId: record.jobId,
  errorMessage: record.errorMessage,
  createdAt: record.createdAt,
});

export class PrismaJobImportRepository implements JobImportRepository {
  async create(input: CreateJobImportInput): Promise<JobImportRecord> {
    const record = await prisma.jobImport.create({ data: input });
    return mapImport(record);
  }

  async createMany(inputs: CreateJobImportInput[]): Promise<void> {
    if (inputs.length === 0) return;
    await prisma.jobImport.createMany({ data: inputs });
  }
}

export const prismaJobImportRepository = new PrismaJobImportRepository();
