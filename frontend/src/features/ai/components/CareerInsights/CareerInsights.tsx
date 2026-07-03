export type CareerInsightsProps = {
  insights: string[];
  nextSteps: string[];
};

export const CareerInsights = ({ insights, nextSteps }: CareerInsightsProps) => {
  if (insights.length === 0 && nextSteps.length === 0) return null;

  return (
    <div className="space-y-4">
      {insights.length > 0 ? (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground">Insights de carreira</h4>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {insights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {nextSteps.length > 0 ? (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground">Próximos passos</h4>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {nextSteps.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
};
