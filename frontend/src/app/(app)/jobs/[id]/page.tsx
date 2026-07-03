import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";

import { JobDetailsPage } from "@/features/job-details";
import { JobDetailsPageSkeleton } from "@/features/job-details/components/JobDetailsPageSkeleton";
import { createPageMetadata } from "@/lib/seo";
import type { ApiResponse, Job } from "@/types";

type JobDetailsRoutePageProps = {
  params: Promise<{ id: string }>;
};

const fetchJobForMetadata = async (id: string): Promise<Job | null> => {
  try {
    const cookieStore = await cookies();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";
    const response = await fetch(`${apiUrl}/jobs/${id}`, {
      headers: {
        Cookie: cookieStore.toString(),
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return null;
    }

    const body = (await response.json()) as ApiResponse<Job>;
    return body.data;
  } catch {
    return null;
  }
};

export const generateMetadata = async ({ params }: JobDetailsRoutePageProps): Promise<Metadata> => {
  const { id } = await params;
  const job = await fetchJobForMetadata(id);

  if (!job) {
    return createPageMetadata({
      title: "Detalhes da vaga",
      description: "Detalhes da vaga no JobTrack AI.",
      path: `/jobs/${id}`,
      noIndex: true,
    });
  }

  return createPageMetadata({
    title: job.title,
    description: `${job.title} em ${job.company.name} — ${job.location}. Acompanhe esta oportunidade no JobTrack AI.`,
    path: `/jobs/${id}`,
    noIndex: true,
    openGraphType: "article",
  });
};

export default function JobDetailsRoutePage() {
  return (
    <Suspense fallback={<JobDetailsPageSkeleton />}>
      <JobDetailsPage />
    </Suspense>
  );
}
