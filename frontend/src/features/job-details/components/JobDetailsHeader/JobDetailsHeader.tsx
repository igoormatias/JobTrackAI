"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/Button";

export type JobDetailsHeaderProps = {
  onOpenJob: () => void;
  canOpenJob?: boolean;
};

export const JobDetailsHeader = ({ onOpenJob, canOpenJob = true }: JobDetailsHeaderProps) => (
  <div className="flex items-center justify-between gap-3">
    <Link href="/jobs">
      <Button type="button" variant="ghost" size="sm" aria-label="Voltar para vagas">
        <ArrowLeft className="mr-1 h-4 w-4" />
        Voltar
      </Button>
    </Link>
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onOpenJob}
      disabled={!canOpenJob}
      aria-label="Abrir vaga"
    >
      <ExternalLink className="mr-1 h-4 w-4" />
      Abrir vaga
    </Button>
  </div>
);
