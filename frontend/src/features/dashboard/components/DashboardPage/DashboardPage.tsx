"use client";

import { Button } from "@/components/ui/Button";
import { Muted } from "@/components/typography";

import { DASHBOARD_LAYOUT } from "../../constants/dashboard-layout";
import { useDashboard } from "../../hooks/use-dashboard";
import { useTopJobs } from "../../hooks/use-top-jobs";
import { DashboardActivityTimeline } from "../DashboardActivityTimeline";
import { DashboardApplicationsChart } from "../DashboardApplicationsChart";
import { DashboardCompaniesCard } from "../DashboardCompaniesCard";
import { DashboardHealthCard } from "../DashboardHealthCard";
import { DashboardInsightCard } from "../DashboardInsightCard";
import { DashboardInterviewsCard } from "../DashboardInterviewsCard";
import { DashboardJobSyncCard } from "../DashboardJobSyncCard";
import { DashboardKpiGrid } from "../DashboardKpiGrid";
import { DashboardPipelineCard } from "../DashboardPipelineCard";
import { DashboardSkeleton } from "../DashboardSkeleton";
import { DashboardTechnologiesCard } from "../DashboardTechnologiesCard";
import { DashboardTopJobsSection } from "../DashboardTopJobsSection";
import { DashboardWelcome } from "../DashboardWelcome";

export const DashboardPage = () => {
  const { data, isLoading, isError, refetch, isRefetching } = useDashboard();
  const { data: topJobsData, isLoading: isTopJobsLoading } = useTopJobs();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="flex w-full min-w-0 flex-col items-center gap-4 py-12 text-center">
        <Muted>Não foi possível carregar o dashboard.</Muted>
        <Button variant="outline" onClick={() => refetch()} disabled={isRefetching}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  const topJobs = topJobsData?.data ?? [];

  return (
    <div className={`${DASHBOARD_LAYOUT.page} min-w-0`}>
      <DashboardWelcome />
      <DashboardKpiGrid kpis={data.kpis} />

      <div className={DASHBOARD_LAYOUT.grid}>
        <div className={DASHBOARD_LAYOUT.topJobs}>
          <DashboardTopJobsSection jobs={topJobs} isLoading={isTopJobsLoading} />
        </div>
        <div className={DASHBOARD_LAYOUT.interviews}>
          <DashboardInterviewsCard
            interviews={data.upcomingInterviews}
            hasCalendarIntegration={data.hasCalendarIntegration}
          />
        </div>
        <div className={DASHBOARD_LAYOUT.chart}>
          <DashboardApplicationsChart data={data.applicationsTimeline} />
        </div>
        <div className={DASHBOARD_LAYOUT.insight}>
          <DashboardInsightCard insight={data.insight} />
        </div>
        <div className={DASHBOARD_LAYOUT.timeline}>
          <DashboardActivityTimeline activities={data.recentActivities} />
        </div>
        <div className={DASHBOARD_LAYOUT.companies}>
          <DashboardCompaniesCard companies={data.topCompanies} />
        </div>
        <div className={DASHBOARD_LAYOUT.technologies}>
          <DashboardTechnologiesCard technologies={data.topTechnologies} />
        </div>
        <div className={DASHBOARD_LAYOUT.pipeline}>
          <DashboardPipelineCard applicationsByStage={data.applicationsByStage} />
        </div>
        <div className={DASHBOARD_LAYOUT.sync}>
          <DashboardJobSyncCard jobSync={data.jobSync} />
        </div>
        <div className={DASHBOARD_LAYOUT.health}>
          <DashboardHealthCard providerHealth={data.jobSync.providerHealth} />
        </div>
      </div>
    </div>
  );
};
