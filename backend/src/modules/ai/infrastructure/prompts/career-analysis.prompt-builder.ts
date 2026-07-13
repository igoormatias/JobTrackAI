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
  const coverage = compressed.match.skillCoverage;
  const applicableFactors = compressed.match.factors.filter((factor) => factor.applicable);
  const skillChecklist = compressed.match.skillEvidence
    .map((item) => `${item.present ? "✔" : "✖"} ${item.name}`)
    .join("\n");
  const factorChecklist = applicableFactors
    .map((factor) => `${factor.matched ? "✔" : "✖"} ${factor.label}: ${factor.detail}`)
    .join("\n");

  return `Você é um career coach especializado em tecnologia. Responda em português do Brasil.

REGRAS OBRIGATÓRIAS:
- O match score (${compressed.match.score}%) já foi calculado pelo engine "${compressed.match.engineVersion}". NÃO recalcule nem altere o score.
- Nunca invente nível de conhecimento, senioridade técnica ou proficiência.
- Utilize exclusivamente os dados recebidos.
- Caso uma informação não exista, informe que ela não foi identificada.
- Nunca faça inferências sobre nível técnico.
- Nunca use palavras como "básico", "intermediário", "avançado", "especialista", "domínio" ou "pouca/muita experiência" para skills.
- Pontos fortes: cite apenas skills/fatores marcados como encontrados/compatíveis nos dados.
- Pontos de atenção: cite apenas skills/fatores marcados como não encontrados/incompatíveis.
- Recomendações: sugira apenas lacunas listadas em "Skills em falta". Nunca sugerir skills já presentes no perfil.
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
- Skills: ${compressed.profile.userSkills.map((s) => s.skillName).join(", ") || "não informadas"}

PROCESSO SELETIVO:
- Estágio atual: ${compressed.tracking.stage}
- Prioridade: ${compressed.tracking.priority}
- Notas: ${compressed.tracking.notes ?? "nenhuma"}
- Timeline recente: ${compressed.timeline.map((e) => `${e.type}: ${e.title}`).join(" | ") || "vazia"}

MATCH ENGINE (${compressed.match.engineVersion}) — EVIDÊNCIA DETERMINÍSTICA:
- Score: ${compressed.match.score}%
- Cobertura de skills: ${coverage.matched} de ${coverage.required} (${coverage.percent}%)
- Skills compatíveis: ${compressed.match.matchedSkills.join(", ") || "nenhuma"}
- Skills em falta: ${compressed.match.missingSkills.join(", ") || "nenhuma"}
- Checklist de skills:
${skillChecklist || "(vazio)"}
- Fatores aplicáveis:
${factorChecklist || "(nenhum)"}

Retorne JSON com:
{
  "summary": "string",
  "matchExplanation": "string",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "learningRecommendations": ["string"],
  "interviewPreparation": ["string"],
  "careerInsights": ["string"],
  "nextSteps": ["string"],
  "confidence": 0.0
}`;
};
