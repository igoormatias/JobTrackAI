"use client";

import { Sparkles } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { Skeleton } from "@/components/feedback/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

import { useCareerAnalysisQuery } from "../../hooks/use-career-analysis-query";
import { useGenerateCareerAnalysisMutation } from "../../hooks/use-generate-career-analysis-mutation";
import { getCareerAnalysisErrorMessage } from "../../services/career-analysis-service";
import { CareerInsights } from "../CareerInsights";
import { InterviewPreparation } from "../InterviewPreparation";
import { LearningRecommendations } from "../LearningRecommendations";
import { MatchExplanation } from "../MatchExplanation";

export type CareerAnalysisCardProps = {
  trackingId?: string;
  matchScore?: number;
  aiAnalysisStatus?: string;
  aiAnalyzedAt?: string | null;
  onAddToPipeline?: () => void;
};

const isAnalyzing = (status?: string): boolean =>
  status === "PENDING" || status === "PROCESSING";

export const CareerAnalysisCard = ({
  trackingId,
  matchScore,
  aiAnalysisStatus,
  aiAnalyzedAt,
  onAddToPipeline,
}: CareerAnalysisCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const shouldPoll = aiAnalysisStatus === "PROCESSING";
  const { data: analysis, isLoading, isError } = useCareerAnalysisQuery(trackingId, {
    refetchInterval: shouldPoll ? 3000 : false,
  });
  const generateMutation = useGenerateCareerAnalysisMutation(trackingId ?? "");

  const handleGenerate = useCallback(
    async (refresh = false) => {
      if (!trackingId) return;
      try {
        await generateMutation.mutateAsync(refresh);
        setExpanded(true);
        toast.success(refresh ? "Análise IA regenerada" : "Análise IA gerada");
      } catch (error) {
        toast.error(getCareerAnalysisErrorMessage(error));
      }
    },
    [generateMutation, trackingId],
  );

  if (!trackingId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden />
            Análise IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Adicione esta vaga ao pipeline para gerar uma análise de carreira personalizada.
          </p>
          {onAddToPipeline ? (
            <Button variant="outline" size="sm" onClick={onAddToPipeline}>
              Adicionar ao pipeline
            </Button>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  const showResult = expanded || Boolean(analysis);
  const isGenerating = generateMutation.isPending;
  const analyzing = isAnalyzing(aiAnalysisStatus);
  const isLegacy = !aiAnalyzedAt && !analyzing;
  const showGenerateButton = isLegacy && !analyzing;
  const showUpdateButton = Boolean(aiAnalyzedAt || analysis);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-primary" aria-hidden />
          Análise IA
        </CardTitle>
        {analysis?.cached ? (
          <Badge variant="outline" className="text-xs">
            Cache
          </Badge>
        ) : null}
        {analysis?.stale ? (
          <Badge variant="secondary" className="text-xs">
            Desatualizada
          </Badge>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-4">
        {analyzing ? (
          <p className="text-sm text-muted-foreground">Analisando compatibilidade...</p>
        ) : null}

        {!showResult && !analyzing ? (
          <p className="text-sm text-muted-foreground">
            Gere insights sobre match, lacunas e preparação para entrevista com base no seu perfil e nesta vaga.
          </p>
        ) : null}

        {isLoading && !analysis && !analyzing ? <Skeleton className="h-24 w-full" aria-hidden /> : null}

        {isError && !analysis ? (
          <p className="text-sm text-destructive">Não foi possível carregar a análise salva.</p>
        ) : null}

        {analysis && showResult ? (
          <div className="space-y-4">
            <p className="text-sm font-medium text-foreground">{analysis.summary}</p>
            <MatchExplanation matchExplanation={analysis.matchExplanation} matchScore={matchScore} />
            {analysis.strengths.length > 0 ? (
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-foreground">Pontos fortes</h4>
                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                  {analysis.strengths.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {analysis.weaknesses.length > 0 ? (
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-foreground">Pontos de atenção</h4>
                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                  {analysis.weaknesses.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <LearningRecommendations items={analysis.learningRecommendations} />
            <InterviewPreparation items={analysis.interviewPreparation} />
            <CareerInsights insights={analysis.careerInsights} nextSteps={analysis.nextSteps} />
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {showGenerateButton ? (
            <Button
              size="sm"
              onClick={() => handleGenerate(false)}
              disabled={isGenerating}
              aria-busy={isGenerating}
            >
              {isGenerating ? "Gerando…" : "Gerar análise IA"}
            </Button>
          ) : null}
          {showUpdateButton ? (
            <Button
              size="sm"
              onClick={() => handleGenerate(false)}
              disabled={isGenerating || analyzing}
              aria-busy={isGenerating}
            >
              {isGenerating ? "Gerando…" : "Atualizar análise"}
            </Button>
          ) : null}
          {analysis && showResult ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleGenerate(true)}
              disabled={isGenerating || analyzing}
            >
              Regenerar
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};
