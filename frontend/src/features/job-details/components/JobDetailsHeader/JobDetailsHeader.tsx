"use client";

import Link from "next/link";
import { ArrowLeft, Share2 } from "lucide-react";

import { Button } from "@/components/ui/Button";

export type JobDetailsHeaderProps = {
  onShare: () => void;
};

export const JobDetailsHeader = ({ onShare }: JobDetailsHeaderProps) => (
  <div className="flex items-center justify-between gap-3">
    <Link href="/jobs">
      <Button type="button" variant="ghost" size="sm" aria-label="Voltar para vagas">
        <ArrowLeft className="mr-1 h-4 w-4" />
        Voltar
      </Button>
    </Link>
    <Button type="button" variant="outline" size="sm" onClick={onShare} aria-label="Compartilhar vaga">
      <Share2 className="mr-1 h-4 w-4" />
      Compartilhar
    </Button>
  </div>
);
