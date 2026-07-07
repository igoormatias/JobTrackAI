import type { PipelineData, PipelineStage } from "@/types";

export const moveApplicationInPipelineData = (
  data: PipelineData,
  applicationId: string,
  targetStage: PipelineStage,
): PipelineData => {
  let movedApplication: PipelineData["columns"][number]["applications"][number] | null = null;

  const columns = data.columns.map((column) => {
    const applications = column.applications.filter((application) => {
      if (application.id === applicationId) {
        movedApplication = { ...application, stage: targetStage };
        return false;
      }
      return true;
    });

    return {
      ...column,
      applications,
      count: applications.length,
    };
  });

  if (!movedApplication) return data;

  const nextColumns = columns.map((column) => {
    if (column.stage !== targetStage) return column;
    const applications = [...column.applications, movedApplication!];
    return {
      ...column,
      applications,
      count: applications.length,
    };
  });

  return {
    ...data,
    columns: nextColumns,
  };
};
