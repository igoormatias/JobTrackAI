export const RESUME_PROMPT_VERSION = "resume-v1";

const MAX_TEXT = 12_000;

export const buildResumeStructurePrompt = (rawText: string): string => {
  const text = rawText.slice(0, MAX_TEXT);
  return `Você é um parser de currículos. Extraia informações do texto abaixo em JSON estruturado.
Nunca invente dados. Use arrays vazios quando não encontrar seções.
Responda APENAS JSON válido com este schema:
{
  "fullName": string | null,
  "professionalSummary": string,
  "experiences": [{ "company": string, "role": string, "startDate": string | null, "endDate": string | null, "description": string, "technologies": string[] }],
  "education": [{ "institution": string, "degree": string | null, "startDate": string | null, "endDate": string | null }],
  "certifications": [{ "name": string, "issuer": string | null, "date": string | null }],
  "languages": [{ "name": string, "level": string | null }],
  "projects": [{ "name": string, "description": string, "technologies": string[] }],
  "softSkills": string[],
  "hardSkills": string[]
}

TEXTO DO CURRÍCULO:
${text}`;
};

export const compressResumeAnalysisSnapshot = <T extends { resume: { professionalSummary: string }; job: { description: string } }>(
  snapshot: T,
): T => ({
  ...snapshot,
  resume: {
    ...snapshot.resume,
    professionalSummary: snapshot.resume.professionalSummary.slice(0, 2000),
  },
  job: {
    ...snapshot.job,
    description: snapshot.job.description.slice(0, 2000),
  },
});

export const buildResumeJobAnalysisPrompt = (snapshot: unknown): string =>
  `Você analisa aderência de currículo a uma vaga. O matchScore e matchedSkills já foram calculados — NÃO recalcule.
Gere JSON com:
{
  "summary": string,
  "atsScore": number (0-100),
  "atsBreakdown": { "keywords": number, "formatting": number, "structure": number, "relevance": number },
  "technicalCompatibility": number (0-100),
  "behavioralCompatibility": number | null,
  "strengths": string[],
  "gaps": string[],
  "missingSkills": string[],
  "underusedExperiences": string[],
  "improvementRanking": [{ "title": string, "impact": string, "priority": number }],
  "suggestions": [{ "type": string, "section": string, "reason": string, "impact": string, "suggestedText": string }],
  "confidence": number (0-1)
}
section deve ser: professionalSummary, experience:0, project:0, hardSkills, etc.
Nunca altere o currículo automaticamente — apenas sugira.

DADOS:
${JSON.stringify(snapshot)}`;
