import { type ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/Card";
import { Caption, Title } from "@/components/typography";
import { cn } from "@/lib/utils";

export type StatCardProps = {
  label: string;
  value: string | number;
  trend?: ReactNode;
  className?: string;
};

export const StatCard = ({ label, value, trend, className }: StatCardProps) => (
  <Card className={cn("", className)}>
    <CardContent className="space-y-2 p-5">
      <Caption>{label}</Caption>
      <div className="flex items-end justify-between gap-2">
        <Title className="text-2xl">{value}</Title>
        {trend}
      </div>
    </CardContent>
  </Card>
);

export type MetricCardProps = {
  title: string;
  description?: string;
  value: string | number;
  footer?: ReactNode;
  className?: string;
};

export const MetricCard = ({
  title,
  description,
  value,
  footer,
  className,
}: MetricCardProps) => (
  <Card className={cn("shadow-glow-primary", className)}>
    <CardContent className="space-y-3 p-5">
      <div>
        <Title>{title}</Title>
        {description ? <Caption className="mt-1 block">{description}</Caption> : null}
      </div>
      <p className="text-3xl font-bold text-primary">{value}</p>
      {footer}
    </CardContent>
  </Card>
);
