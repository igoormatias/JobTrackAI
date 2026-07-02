"use client";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export const formatPublishedAgo = (publishedAt: string): string =>
  formatDistanceToNow(new Date(publishedAt), {
    addSuffix: true,
    locale: ptBR,
  });

export const getJobSourceLabel = (source: string): string => {
  const labels: Record<string, string> = {
    gupy: "Gupy",
    linkedin: "LinkedIn",
    programathor: "ProgramaThor",
    manual: "Manual",
  };

  return labels[source] ?? source;
};

export const getCompanyInitials = (name: string): string =>
  name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

export const formatModality = (modality: string): string => {
  const labels: Record<string, string> = {
    remote: "Remoto",
    hybrid: "Híbrido",
    onsite: "Presencial",
  };
  return labels[modality] ?? modality;
};
