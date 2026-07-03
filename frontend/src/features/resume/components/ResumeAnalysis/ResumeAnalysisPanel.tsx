"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

import { useAnalyzeJobMutation } from "../../hooks/use-resume-queries";
import type { ResumeJobAnalysis, ResumeSuggestion } from "../../services/resume-service";
import { ATSScoreCard } from "../ATSScoreCard/ATSScoreCard";
import { SuggestionCard } from "../SuggestionCard/SuggestionCard";

export const ResumeAnalysisPanel = () => {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<{
    analysis: ResumeJobAnalysis;
    suggestions: ResumeSuggestion[];
    cached: boolean;
  } | null>(null);
  const analyzeMutation = useAnalyzeJobMutation();

  const handleAnalyze = () => {
    if (!url.trim()) return;
    analyzeMutation.mutate(url.trim(), {
      onSuccess: (data) => {
        setResult({ analysis: data.analysis, suggestions: data.suggestions, cached: data.cached });
        toast.success(data.cached ? "Análise recuperada do cache" : "Análise concluída");
      },
      onError: (error: unknown) => {
        const message =
          (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          "Erro ao analisar vaga";
        toast.error(message);
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="job-url">URL da vaga</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="job-url"
            type="url"
            placeholder="https://portal.gupy.io/job/12345"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={analyzeMutation.isPending}
          />
          <Button type="button" onClick={handleAnalyze} disabled={!url.trim() || analyzeMutation.isPending}>
            {analyzeMutation.isPending ? "Analisando..." : "Analisar"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Gupy suportado. LinkedIn e Programathor em breve.</p>
      </div>

      {result ? (
        <div className="space-y-6">
          <ATSScoreCard analysis={result.analysis} />

          <div className="rounded-lg border border-border p-4">
            <p className="text-sm text-foreground">{result.analysis.summary}</p>
          </div>

          {result.analysis.strengths.length ? (
            <div>
              <h4 className="mb-2 font-semibold">Pontos fortes</h4>
              <ul className="list-inside list-disc text-sm text-muted-foreground">
                {result.analysis.strengths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {result.analysis.gaps.length ? (
            <div>
              <h4 className="mb-2 font-semibold">Gaps</h4>
              <ul className="list-inside list-disc text-sm text-muted-foreground">
                {result.analysis.gaps.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {result.analysis.improvementRanking.length ? (
            <div>
              <h4 className="mb-2 font-semibold">Ranking de melhorias</h4>
              <ol className="space-y-1 text-sm">
                {result.analysis.improvementRanking
                  .sort((a, b) => a.priority - b.priority)
                  .map((item) => (
                    <li key={item.title}>
                      <span className="font-medium">{item.title}</span> — {item.impact}
                    </li>
                  ))}
              </ol>
            </div>
          ) : null}

          {result.suggestions.length ? (
            <div className="space-y-3">
              <h4 className="font-semibold">Sugestões</h4>
              {result.suggestions.map((suggestion) => (
                <SuggestionCard key={suggestion.id} suggestion={suggestion} />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
