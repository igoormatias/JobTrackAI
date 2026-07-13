import type { AnalysisSnapshot } from "../../domain/entities/career-analysis.entity.js";

const MAX_DESCRIPTION = 1200;
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
  const foundSkills = compressed.match.skillEvidence
    .filter((item) => item.present)
    .map((item) => item.name);
  const missingSkills = compressed.match.missingSkills;
  const factorChecklist = applicableFactors
    .map((factor) => `${factor.matched ? "✔" : "✖"} ${factor.label}`)
    .join("; ");

  return `Você é um career coach de tecnologia. Responda em português do Brasil.

REGRAS:
- Match score (${compressed.match.score}%) já calculado por "${compressed.match.engineVersion}". NÃO recalcule.
- Nunca invente nível/proficiência (básico, intermediário, avançado, especialista, domínio).
- Use somente os dados recebidos. Se faltar dado, diga que não foi identificado.
- Seja MUITO conciso. Frases curtas. Sem parágrafos longos.
- strengths: só evidências encontradas. weaknesses: só lacunas/incompatibilidades. recommendations: só lacunas.
- Retorne APENAS JSON válido.

VAGA: ${compressed.job.title} @ ${compressed.job.companyName}
Senioridade: ${compressed.job.seniority ?? "n/d"} | Modalidade: ${compressed.job.modality ?? "n/d"}
Techs: ${compressed.job.technologySlugs.join(", ") || "n/d"}
Requisitos: ${compressed.job.requirementSlugs.join(", ") || "n/d"}
Descrição: ${compressed.job.description}

PERFIL: área ${compressed.profile.area ?? "n/d"} | senioridade ${compressed.profile.seniority ?? "n/d"} | modalidade ${compressed.profile.modality ?? "n/d"}
Skills: ${compressed.profile.userSkills.map((s) => s.skillName).join(", ") || "n/d"}

PROCESSO: ${compressed.tracking.stage} | prioridade ${compressed.tracking.priority}

MATCH: ${compressed.match.score}% | cobertura ${coverage.matched}/${coverage.required} (${coverage.percent}%)
Encontradas: ${foundSkills.join(", ") || "nenhuma"}
Faltantes: ${missingSkills.join(", ") || "nenhuma"}
Fatores: ${factorChecklist || "nenhum"}

JSON:
{
  "summary": "1-2 frases curtas",
  "matchExplanation": "2-4 frases objetivas com motivos",
  "strengths": ["até 4 itens curtos"],
  "weaknesses": ["até 4 itens curtos"],
  "learningRecommendations": ["até 3 lacunas"],
  "interviewPreparation": ["até 3 itens"],
  "careerInsights": ["até 2 itens"],
  "nextSteps": ["até 3 ações"],
  "confidence": 0.0
}`;
};
