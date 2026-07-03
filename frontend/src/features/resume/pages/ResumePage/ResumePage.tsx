"use client";

import { Spinner } from "@/components/feedback/Spinner";

import { ResumeEditor } from "../../components/ResumeEditor/ResumeEditor";
import { ResumeImporter } from "../../components/ResumeImporter/ResumeImporter";
import { ResumeSectionLayout } from "../../components/ResumeSectionLayout/ResumeSectionLayout";
import { useResumeQuery } from "../../hooks/use-resume-queries";
import { EMPTY_RESUME_CONTENT } from "../../services/resume-service";

export const ResumePage = () => {
  const { data, isLoading, refetch } = useResumeQuery();

  if (isLoading) {
    return (
      <ResumeSectionLayout>
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      </ResumeSectionLayout>
    );
  }

  const content = data?.currentVersion?.content ?? EMPTY_RESUME_CONTENT;

  return (
    <ResumeSectionLayout>
      <ResumeImporter onSuccess={() => void refetch()} />
      <ResumeEditor initialContent={content} />
    </ResumeSectionLayout>
  );
};
