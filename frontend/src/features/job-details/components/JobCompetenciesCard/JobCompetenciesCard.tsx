import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";

import { JobDetailsEmptySection } from "../JobDetailsEmptySection";

export type JobCompetenciesCardProps = {
  competencies: string[];
};

export const JobCompetenciesCard = ({ competencies }: JobCompetenciesCardProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base">Competências</CardTitle>
    </CardHeader>
    <CardContent className="flex flex-wrap gap-2">
      {competencies.length > 0 ? (
        competencies.map((item) => <Chip key={item}>{item}</Chip>)
      ) : (
        <JobDetailsEmptySection message="Sem competências informadas." />
      )}
    </CardContent>
  </Card>
);
