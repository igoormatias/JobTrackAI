export type LearningRecommendationsProps = {
  items: string[];
};

export const LearningRecommendations = ({ items }: LearningRecommendationsProps) => {
  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-foreground">Recomendações de aprendizado</h4>
      <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
};
