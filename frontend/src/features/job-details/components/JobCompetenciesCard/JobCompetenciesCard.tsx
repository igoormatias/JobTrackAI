import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";

export type JobCompetenciesCardProps = {
  competencies: string[];
};

export const JobCompetenciesCard = ({ competencies }: JobCompetenciesCardProps) => {
  if (competencies.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Competências</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {competencies.map((item) => (
          <Chip key={item}>{item}</Chip>
        ))}
      </CardContent>
    </Card>
  );
};
