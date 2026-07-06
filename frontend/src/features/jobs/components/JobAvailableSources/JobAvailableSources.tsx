"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from "@/components/ui/Dropdown";
import { openOriginalJobLabel } from "@/constants/action-labels";
import { ACTION_TOOLTIPS } from "@/constants/action-tooltips";
import { openJobUrl } from "@/lib/jobs/open-job-url";
import type { Job, JobAlternateSource, JobSource } from "@/types";

const SOURCE_LABELS: Record<JobSource, string> = {
  gupy: "Gupy",
  linkedin: "LinkedIn",
  programathor: "Programathor",
  manual: "Manual",
  referral: "Indicação",
  recruiter: "Recrutador",
  company_site: "Site da empresa",
  other: "Outro",
};

const getSources = (job: {
  source?: JobSource;
  sourceUrl: string;
  alternateSources?: JobAlternateSource[];
}): JobAlternateSource[] => {
  const primary: JobAlternateSource = {
    source: job.source ?? "other",
    sourceUrl: job.sourceUrl,
    isPrimary: true,
  };
  const alternates = job.alternateSources ?? [];
  const merged = [primary, ...alternates.filter((item) => item.sourceUrl !== job.sourceUrl)];
  return merged.filter(
    (item, index, list) =>
      list.findIndex(
        (entry) => entry.source === item.source && entry.sourceUrl === item.sourceUrl,
      ) === index,
  );
};

export type JobAvailableSourcesProps = {
  job: {
    source?: JobSource;
    sourceUrl: string;
    alternateSources?: JobAlternateSource[];
    status?: Job["status"];
  };
};

export const JobAvailableSources = ({ job }: JobAvailableSourcesProps) => {
  const sources = getSources(job);
  if (sources.length <= 1) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted-foreground">Disponível em</span>
      {sources.map((source) => (
        <Badge key={`${source.source}-${source.sourceUrl}`} variant="secondary" className="text-xs">
          {SOURCE_LABELS[source.source] ?? source.source}
        </Badge>
      ))}
    </div>
  );
};

export type OpenOriginalJobButtonProps = {
  job: {
    source?: JobSource;
    sourceUrl: string;
    alternateSources?: JobAlternateSource[];
    status: Job["status"];
  };
  size?: "sm" | "default";
  variant?: "default" | "outline" | "ghost";
};

export const OpenOriginalJobButton = ({
  job,
  size = "default",
  variant = "outline",
}: OpenOriginalJobButtonProps) => {
  const sources = getSources(job);

  if (sources.length <= 1) {
    return (
      <Button
        type="button"
        variant={variant}
        size={size}
        disabled={!job.sourceUrl}
        title={ACTION_TOOLTIPS.openOriginalJob}
        onClick={() => openJobUrl({ sourceUrl: job.sourceUrl, status: job.status })}
      >
        {openOriginalJobLabel(job.source)}
      </Button>
    );
  }

  return (
    <Dropdown>
      <DropdownTrigger asChild>
        <Button type="button" variant={variant} size={size} title={ACTION_TOOLTIPS.openOriginalJob}>
          {openOriginalJobLabel()}
        </Button>
      </DropdownTrigger>
      <DropdownContent align="end">
        {sources.map((source) => (
          <DropdownItem
            key={`${source.source}-${source.sourceUrl}`}
            onClick={() => openJobUrl({ sourceUrl: source.sourceUrl, status: job.status })}
          >
            {openOriginalJobLabel(source.source)}
          </DropdownItem>
        ))}
      </DropdownContent>
    </Dropdown>
  );
};
