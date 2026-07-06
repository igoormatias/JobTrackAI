"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { OpenOriginalJobButton } from "@/features/jobs/components/JobAvailableSources";
import type { Job, JobAlternateSource, JobSource } from "@/types";

export type JobDetailsHeaderProps = {
  job: {
    source?: JobSource;
    sourceUrl: string;
    alternateSources?: JobAlternateSource[];
    status: Job["status"];
  };
};

export const JobDetailsHeader = ({ job }: JobDetailsHeaderProps) => (
  <div className="flex items-center justify-between gap-3">
    <Link href="/jobs">
      <Button type="button" variant="ghost" size="sm" aria-label="Voltar para vagas">
        <ArrowLeft className="mr-1 h-4 w-4" />
        Voltar
      </Button>
    </Link>
    <OpenOriginalJobButton job={job} size="sm" variant="outline" />
  </div>
);
