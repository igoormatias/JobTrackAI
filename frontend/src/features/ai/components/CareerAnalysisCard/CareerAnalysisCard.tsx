"use client";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronDown, Copy, MoreHorizontal, RefreshCw, Sparkles } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { Skeleton } from "@/components/feedback/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from "@/components/ui/Dropdown";

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

  const handleCopy = useCallback(async () => {
    if (!analysis) return;
    const text = [
      analysis.summary,
      analysis.matchExplanation,
      ...(analysis.strengths.length ? ["Pontos fortes:", ...analysis.strengths] : []),
      ...(analysis.weaknesses.length ? ["Pontos de atenção:", ...analysis.weaknesses] : []),
      ...(analysis.nextSteps.length ? ["Próximos passos:", ...analysis.nextSteps] : []),
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Análise copiada");
    } catch {
      toast.error("Não foi possível copiar a análise");
    }
  }, [analysis]);

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
  const hasAnalysis = Boolean(analysis) || Boolean(aiAnalyzedAt);
  const generatedAt = analysis?.generatedAt ?? aiAnalyzedAt ?? null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-primary" aria-hidden />
          Análise IA
        </CardTitle>
        <div className="flex flex-wrap items-center justify-end gap-1">
          {generatedAt ? (
            <Badge variant="outline" className="text-xs">
              Gerado{" "}
              {formatDistanceToNow(new Date(generatedAt), {
                addSuffix: true,
                locale: ptBR,
              })}
            </Badge>
          ) : null}
          {analysis?.stale ? (
            <Badge variant="secondary" className="text-xs">
              Desatualizada
            </Badge>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {analyzing ? (
          <p className="text-sm text-muted-foreground">Analisando compatibilidade...</p>
        ) : null}

        {!showResult && !analyzing ? (
          <p className="text-sm text-muted-foreground">
            Gere insights objetivos sobre match, lacunas e próximos passos.
          </p>
        ) : null}

        {isLoading && !analysis && !analyzing ? <Skeleton className="h-24 w-full" aria-hidden /> : null}

        {isError && !analysis ? (
          <p className="text-sm text-destructive">Não foi possível carregar a análise salva.</p>
        ) : null}

        {analysis && showResult ? (
          <div className="space-y-4">
            <p className="text-sm font-medium text-foreground">{analysis.summary}</p>
            {typeof analysis.confidence === "number" ? (
              <p className="text-xs text-muted-foreground">
                Confiança da IA: {Math.round(analysis.confidence * 100)}%
              </p>
            ) : null}
            <MatchExplanation
              matchExplanation={analysis.matchExplanation}
              matchScore={matchScore}
              matchEngineVersion={analysis.matchEngineVersion}
            />
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

        <div className="flex flex-wrap items-center gap-2">
          {!hasAnalysis ? (
            <Button
              size="sm"
              onClick={() => handleGenerate(false)}
              disabled={isGenerating || analyzing}
              aria-busy={isGenerating}
            >
              {isGenerating ? "Gerando…" : "Gerar análise IA"}
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                onClick={() => handleGenerate(false)}
                disabled={isGenerating || analyzing}
                aria-busy={isGenerating}
              >
                {isGenerating ? "Gerando…" : "Atualizar análise"}
              </Button>
              <Dropdown>
                <DropdownTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isGenerating || analyzing}
                    aria-label="Mais ações da análise"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownTrigger>
                <DropdownContent align="end">
                  <DropdownItem onSelect={() => void handleGenerate(true)}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerar análise
                  </DropdownItem>
                  {analysis ? (
                    <DropdownItem onSelect={() => void handleCopy()}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copiar análise
                    </DropdownItem>
                  ) : null}
                </DropdownContent>
              </Dropdown>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
