import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import type { Technology } from "@/types";

export type JobTechnologiesCardProps = {
  technologies: Technology[];
};

export const JobTechnologiesCard = ({ technologies }: JobTechnologiesCardProps) => {
  if (technologies.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Tecnologias</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {technologies.map((tech) => (
          <Chip key={tech.id}>{tech.name}</Chip>
        ))}
      </CardContent>
    </Card>
  );
};
