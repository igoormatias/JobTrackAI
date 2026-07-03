import type { ResumeJobAnalysis } from "../../services/resume-service";

export type ATSScoreCardProps = {
  analysis: ResumeJobAnalysis;
};

export const ATSScoreCard = ({ analysis }: ATSScoreCardProps) => (
  <div className="rounded-lg border border-border bg-card p-4">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-sm text-muted-foreground">Pontuação ATS</p>
        <p className="text-3xl font-bold text-foreground">{analysis.atsScore}%</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Match Score</p>
        <p className="text-3xl font-bold text-primary">{analysis.matchScore}%</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Skills encontradas</p>
        <p className="text-xl font-semibold">{analysis.matchedSkillsCount}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Skills ausentes</p>
        <p className="text-xl font-semibold text-destructive">{analysis.missingSkillsCount}</p>
      </div>
    </div>

    <div className="mt-4 grid gap-2 sm:grid-cols-2">
      <div className="text-sm">
        <span className="text-muted-foreground">Compatibilidade técnica: </span>
        {analysis.technicalCompatibility}%
      </div>
      {analysis.behavioralCompatibility != null ? (
        <div className="text-sm">
          <span className="text-muted-foreground">Compatibilidade comportamental: </span>
          {analysis.behavioralCompatibility}%
        </div>
      ) : null}
    </div>

    <div className="mt-4 grid gap-2 sm:grid-cols-4">
      {Object.entries(analysis.atsBreakdown).map(([key, value]) => (
        <div key={key} className="rounded bg-muted/50 px-2 py-1 text-center text-xs capitalize">
          <div className="font-medium">{key}</div>
          <div>{value}%</div>
        </div>
      ))}
    </div>
  </div>
);
