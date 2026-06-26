import { faker } from "@faker-js/faker";

import type {
  Application,
  Company,
  DashboardData,
  Job,
  Notification,
  Profile,
  User,
  UserSettings,
} from "@/types";

import { KNOWN_COMPANIES, PIPELINE_STAGES, PROFESSIONAL_AREAS } from "../constants/mock-data";
import {
  createApplication,
  createCompany,
  createDashboard,
  createJob,
  createNotification,
  createProfile,
  createSettings,
  createUser,
} from "../factories";

export type FixtureStore = {
  user: User;
  profile: Profile;
  companies: Company[];
  jobs: Job[];
  favoriteJobIds: Set<string>;
  applications: Application[];
  notifications: Notification[];
  dashboard: DashboardData;
  settings: UserSettings;
};

const buildCompanies = (): Company[] => {
  const companies: Company[] = KNOWN_COMPANIES.map((company, index) =>
    createCompany({
      index: index + 1,
      name: company.name,
      industry: company.industry,
      location: company.location,
    }),
  );

  for (let index = companies.length + 1; index <= 30; index += 1) {
    companies.push(
      createCompany({
        index,
        name: faker.company.name(),
        industry: faker.commerce.department(),
        location: `${faker.location.city()}, ${faker.location.state({ abbreviated: true })}`,
      }),
    );
  }

  return companies;
};

const buildJobs = (companies: Company[], favoriteJobIds: Set<string>): Job[] => {
  const jobs: Job[] = [];

  for (let index = 1; index <= 150; index += 1) {
    const company = companies[(index - 1) % companies.length]!;
    const area = PROFESSIONAL_AREAS[(index - 1) % PROFESSIONAL_AREAS.length]!;
    const isFavorite = favoriteJobIds.has(`job_${String(index).padStart(4, "0")}`);

    jobs.push(
      createJob({
        index,
        company,
        area,
        isFavorite,
        matchScore: index % 7 === 0 ? 94 : undefined,
      }),
    );
  }

  return jobs;
};

const buildApplications = (userId: string, jobs: Job[]): Application[] => {
  const selectedJobs = jobs.slice(0, 18);

  return selectedJobs.map((job, index) =>
    createApplication({
      index: index + 1,
      userId,
      job,
      stage: PIPELINE_STAGES[index % PIPELINE_STAGES.length]!,
    }),
  );
};

const buildNotifications = (userId: string): Notification[] => {
  const types = [
    "new_job",
    "recommendation",
    "pipeline_change",
    "interview_reminder",
    "dashboard_update",
  ] as const;

  return Array.from({ length: 25 }, (_, index) =>
    createNotification({
      index: index + 1,
      userId,
      type: types[index % types.length]!,
      read: index > 6,
    }),
  );
};

export const buildFixtureStore = (): FixtureStore => {
  faker.seed(2025);

  const user = createUser();
  const profile = createProfile({ userId: user.id });
  const companies = buildCompanies();

  const favoriteJobIds = new Set(
    Array.from({ length: 12 }, (_, index) => `job_${String(index + 1).padStart(4, "0")}`),
  );

  const jobs = buildJobs(companies, favoriteJobIds).map((job) => ({
    ...job,
    isFavorite: favoriteJobIds.has(job.id),
  }));

  companies.forEach((company) => {
    company.jobCount = jobs.filter((job) => job.companyId === company.id).length;
  });

  const applications = buildApplications(user.id, jobs);
  const notifications = buildNotifications(user.id);
  const dashboard = createDashboard({ jobs, applications });
  const settings = createSettings({ userId: user.id });

  return {
    user,
    profile,
    companies,
    jobs,
    favoriteJobIds,
    applications,
    notifications,
    dashboard,
    settings,
  };
};

let fixtureStore: FixtureStore | null = null;

export const getFixtureStore = (): FixtureStore => {
  if (!fixtureStore) {
    fixtureStore = buildFixtureStore();
  }

  return fixtureStore;
};

export const resetFixtureStore = (): FixtureStore => {
  fixtureStore = buildFixtureStore();
  return fixtureStore;
};
