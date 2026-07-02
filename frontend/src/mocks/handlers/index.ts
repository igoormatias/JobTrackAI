import { applicationsHandlers } from "./applications.handlers";
import { authHandlers } from "./auth.handlers";
import { companiesHandlers } from "./companies.handlers";
import { dashboardHandlers } from "./dashboard.handlers";
import { jobsHandlers } from "./jobs.handlers";
import { notificationsHandlers } from "./notifications.handlers";
import { pipelineHandlers } from "./pipeline.handlers";
import { profileHandlers } from "./profile.handlers";
import { settingsHandlers } from "./settings.handlers";

import { trackingHandlers } from "./tracking.handlers";

export const handlers = [
  ...authHandlers,
  ...dashboardHandlers,
  ...jobsHandlers,
  ...companiesHandlers,
  ...profileHandlers,
  ...applicationsHandlers,
  ...pipelineHandlers,
  ...trackingHandlers,
  ...notificationsHandlers,
  ...settingsHandlers,
];
