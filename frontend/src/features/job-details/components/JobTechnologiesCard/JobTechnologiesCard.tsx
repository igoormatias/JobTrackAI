import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import type { Technology } from "@/types";

import { JobDetailsEmptySection } from "../JobDetailsEmptySection";

export type JobTechnologiesCardProps = {
  technologies: Technology[];
};

export const JobTechnologiesCard = ({ technologies }: JobTechnologiesCardProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base">Tecnologias</CardTitle>
    </CardHeader>
    <CardContent className="flex flex-wrap gap-2">
      {technologies.length > 0 ? (
        technologies.map((tech) => <Chip key={tech.id}>{tech.name}</Chip>)
      ) : (
        <JobDetailsEmptySection message="Sem tecnologias informadas." />
      )}
    </CardContent>
  </Card>
);
