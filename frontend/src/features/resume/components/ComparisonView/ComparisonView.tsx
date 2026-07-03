import type { ResumeStructuredContent } from "../../services/resume-service";

export type ComparisonViewProps = {
  before: ResumeStructuredContent;
  after: ResumeStructuredContent;
  highlightSection?: string;
};

export const ComparisonView = ({ before, after, highlightSection }: ComparisonViewProps) => {
  const renderBlock = (label: string, beforeText: string, afterText: string) => {
    const changed = beforeText !== afterText;
    const highlighted = highlightSection === label;
    return (
      <div
        className={
          highlighted || changed ? "rounded border border-amber-500/40 bg-amber-500/5 p-3" : "p-3"
        }
      >
        <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">{label}</p>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Antes</p>
            <p className="whitespace-pre-wrap text-sm">{beforeText || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Depois</p>
            <p className="whitespace-pre-wrap text-sm">{afterText || "—"}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      <h4 className="font-semibold">Comparação</h4>
      {renderBlock("Resumo", before.professionalSummary, after.professionalSummary)}
      {renderBlock(
        "Skills",
        before.hardSkills.join(", "),
        after.hardSkills.join(", "),
      )}
    </div>
  );
};
