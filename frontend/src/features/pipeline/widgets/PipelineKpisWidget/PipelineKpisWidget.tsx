"use client";

import type { PipelineKpis } from "@/types";

import { PipelineKpisRow } from "../../components/PipelineKpisRow";

export type PipelineKpisWidgetProps = {
  kpis: PipelineKpis;
};

export const PipelineKpisWidget = ({ kpis }: PipelineKpisWidgetProps) => (
  <PipelineKpisRow kpis={kpis} />
);
