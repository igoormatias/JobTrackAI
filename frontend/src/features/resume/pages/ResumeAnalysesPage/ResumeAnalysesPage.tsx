"use client";

import { ResumeAnalysisPanel } from "../../components/ResumeAnalysis/ResumeAnalysisPanel";
import { ResumeSectionLayout } from "../../components/ResumeSectionLayout/ResumeSectionLayout";

export const ResumeAnalysesPage = () => (
  <ResumeSectionLayout title="Análises" description="Compare seu currículo com vagas e receba sugestões.">
    <ResumeAnalysisPanel />
  </ResumeSectionLayout>
);
