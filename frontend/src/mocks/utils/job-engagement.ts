import type { FixtureStore } from "@/mocks/fixtures/build-fixture-store";
import type { Job, JobEngagementState } from "@/types";

export const resolveJobEngagementState = (
  jobId: string,
  store: Pick<FixtureStore, "favoriteJobIds" | "viewedJobIds" | "applications">,
): JobEngagementState => {
  const application = store.applications.find((item) => item.jobId === jobId);

  if (application?.stage === "closed") {
    return "rejected";
  }

  if (application && application.stage !== "discovery") {
    return "applied";
  }

  if (store.favoriteJobIds.has(jobId)) {
    return "favorited";
  }

  if (store.viewedJobIds.has(jobId)) {
    return "viewed";
  }

  return "new";
};

export const enrichJobWithEngagement = (job: Job, store: FixtureStore): Job => {
  const isFavorite = store.favoriteJobIds.has(job.id);
  const engagementState = resolveJobEngagementState(job.id, store);

  return {
    ...job,
    isFavorite,
    engagementState,
  };
};
