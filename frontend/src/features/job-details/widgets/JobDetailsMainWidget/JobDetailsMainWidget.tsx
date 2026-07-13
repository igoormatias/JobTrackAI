"use client";

import type { Job } from "@/types";
import type { JobMatchDto, LearningGap } from "../../types/job-details.types";
import { JobCompetenciesCard } from "../../components/JobCompetenciesCard";
import { JobDescriptionCard } from "../../components/JobDescriptionCard";
import { JobDetailsHero } from "../../components/JobDetailsHero";
import { JobLearningGapsCard } from "../../components/JobLearningGapsCard";
import { JobMatchScoreCircle } from "../../components/JobMatchScoreCircle";
import { JobTechnologiesCard } from "../../components/JobTechnologiesCard";
import { JobWhyThisJobCard } from "../../components/JobWhyThisJobCard";
import { MatchBreakdownCard } from "@/features/recommendations/components/MatchBreakdownCard";
import { JOB_DETAILS_LAYOUT } from "../../constants/job-details-constants";

export type JobDetailsMainWidgetProps = {
  job: Job;
  match?: JobMatchDto;
  gaps: LearningGap[];
};

export const JobDetailsMainWidget = ({ job, match, gaps }: JobDetailsMainWidgetProps) => (
  <div className={JOB_DETAILS_LAYOUT.main}>
    <JobDetailsHero job={job} />
    {match ? (
      <div className="lg:hidden">
        <JobMatchScoreCircle score={match.matchScore.score} label={match.compatibilityLabel} />
      </div>
    ) : null}
    {match ? <JobWhyThisJobCard reasons={match.matchScore.reasons} /> : null}
    {match ? <MatchBreakdownCard matchScore={match.matchScore} /> : null}
    <JobLearningGapsCard gaps={gaps} />
    <JobDescriptionCard job={job} />
    <JobTechnologiesCard technologies={job.technologies} />
    <JobCompetenciesCard competencies={job.requirements} />
  </div>
);
