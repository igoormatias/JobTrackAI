import type { AnalysisSnapshot } from "../../domain/entities/career-analysis.entity.js";

const MAX_DESCRIPTION = 2000;
const MAX_REQUIREMENTS = 10;
const MAX_TIMELINE = 5;

export const compressAnalysisSnapshot = (snapshot: AnalysisSnapshot): AnalysisSnapshot => ({
  ...snapshot,
  job: {
    ...snapshot.job,
    description: snapshot.job.description.slice(0, MAX_DESCRIPTION),
    requirementSlugs: snapshot.job.requirementSlugs.slice(0, MAX_REQUIREMENTS),
  },
  timeline: snapshot.timeline.slice(0, MAX_TIMELINE),
});

export const buildCareerAnalysisPrompt = (snapshot: AnalysisSnapshot): string => {
  const compressed = compressAnalysisSnapshot(snapshot);

  return `Você é um career coach especializado em tecnologia. Responda em português do Brasil.

REGRAS OBRIGATÓRIAS:
- O match score (${compressed.match.score}%) já foi calculado pelo engine "${compressed.match.engineVersion}". NÃO recalcule nem altere o score.
- Explique o match com base nos dados fornecidos.
- Seja prático, objetivo e acionável.
- Retorne APENAS JSON válido no schema solicitado.

DADOS DA VAGA:
- Título: ${compressed.job.title}
- Empresa: ${compressed.job.companyName}
- Senioridade: ${compressed.job.seniority ?? "não informada"}
- Modalidade: ${compressed.job.modality ?? "não informada"}
- Tecnologias: ${compressed.job.technologySlugs.join(", ") || "não informadas"}
- Requisitos: ${compressed.job.requirementSlugs.join(", ") || "não informados"}
- Descrição (resumo): ${compressed.job.description}

PERFIL DO USUÁRIO:
- Área: ${compressed.profile.area ?? "não informada"}
- Senioridade: ${compressed.profile.seniority ?? "não informada"}
- Modalidade: ${compressed.profile.modality ?? "não informada"}
- Localização: ${compressed.profile.location}
- Skills: ${compressed.profile.userSkills.map((s) => `${s.skillName} (${s.level})`).join(", ") || "não informadas"}

PROCESSO SELETIVO:
- Estágio atual: ${compressed.tracking.stage}
- Prioridade: ${compressed.tracking.priority}
- Notas: ${compressed.tracking.notes ?? "nenhuma"}
- Timeline recente: ${compressed.timeline.map((e) => `${e.type}: ${e.title}`).join(" | ") || "vazia"}

MATCH ENGINE (rules-v2):
- Score: ${compressed.match.score}%
- Skills compatíveis: ${compressed.match.matchedSkills.join(", ") || "nenhuma"}
- Skills em falta: ${compressed.match.missingSkills.join(", ") || "nenhuma"}

Retorne JSON com:
{
  "summary": "string",
  "matchExplanation": "string",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "missingSkills": ["string"],
  "learningRecommendations": ["string"],
  "interviewPreparation": ["string"],
  "careerInsights": ["string"],
  "nextSteps": ["string"],
  "confidence": 0.0
}`;
};
