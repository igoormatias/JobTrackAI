import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { LearningGap } from "../../types/job-details.types";
import { LEARNING_GAP_IMPORTANCE_LABELS } from "../../constants/job-details-constants";
import { JobDetailsEmptySection } from "../JobDetailsEmptySection";

export type JobLearningGapsCardProps = {
  gaps: LearningGap[];
};

export const JobLearningGapsCard = ({ gaps }: JobLearningGapsCardProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base">O que você precisa aprender?</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {gaps.length === 0 ? (
        <JobDetailsEmptySection message="Você já cobre as principais competências desta vaga." />
      ) : (
        gaps.map((gap) => (
          <div key={gap.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 p-3">
            <div>
              <p className="font-medium text-foreground">{gap.name}</p>
              <p className="text-xs text-muted-foreground">{gap.category}</p>
            </div>
            <Badge variant={gap.importance === "high" ? "default" : "secondary"}>
              {LEARNING_GAP_IMPORTANCE_LABELS[gap.importance]}
            </Badge>
          </div>
        ))
      )}
    </CardContent>
  </Card>
);
