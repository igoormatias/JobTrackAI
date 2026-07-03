export const DASHBOARD_LAYOUT = {
  page: "flex flex-col gap-6",
  grid: "grid min-w-0 grid-cols-1 items-stretch gap-6 lg:grid-cols-12",
  kpiGrid: "grid min-w-0 grid-cols-2 gap-4 sm:grid-cols-3 lg:col-span-12 lg:grid-cols-5",
  insight: "lg:col-span-4",
  chart: "lg:col-span-8",
  topJobs: "min-w-0 lg:col-span-7",
  interviews: "min-w-0 lg:col-span-5",
  timeline: "lg:col-span-6",
  companies: "lg:col-span-3",
  technologies: "lg:col-span-3",
} as const;
