import type { PipelineKpis } from "@/types";

import { Card, CardContent } from "@/components/ui/Card";

export type PipelineKpisRowProps = {
  kpis: PipelineKpis;
};

const items: Array<{ key: keyof PipelineKpis; label: string; suffix?: string }> = [
  { key: "totalApplications", label: "Candidaturas" },
  { key: "interviews", label: "Entrevistas" },
  { key: "offers", label: "Ofertas" },
  { key: "rejections", label: "Rejeições" },
  { key: "conversionRate", label: "Conversão", suffix: "%" },
  { key: "avgDaysPerStage", label: "Média/etapa", suffix: "d" },
];

export const PipelineKpisRow = ({ kpis }: PipelineKpisRowProps) => (
  <div className="grid grid-cols-2 gap-3 lg:grid-cols-6" aria-label="Indicadores do pipeline">
    {items.map((item) => (
      <Card key={item.key}>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">{item.label}</p>
          <p className="text-2xl font-bold text-foreground">
            {kpis[item.key]}
            {item.suffix ?? ""}
          </p>
        </CardContent>
      </Card>
    ))}
  </div>
);
