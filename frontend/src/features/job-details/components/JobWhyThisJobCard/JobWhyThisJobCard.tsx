import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import type { MatchReason } from "@/types/match";

export type JobWhyThisJobCardProps = {
  reasons: MatchReason[];
};

export const JobWhyThisJobCard = ({ reasons }: JobWhyThisJobCardProps) => {
  const matched = reasons.filter((reason) => reason.matched);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Por que essa vaga?</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {matched.length > 0 ? (
          matched.map((reason) => (
            <Chip key={reason.id}>
              ✔ {reason.label}
            </Chip>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">Nenhum motivo de compatibilidade disponível.</p>
        )}
      </CardContent>
    </Card>
  );
};
