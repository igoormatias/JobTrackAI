"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/Button";
import { Muted } from "@/components/typography";
import type { Job } from "@/types";

import { JOBS_LAYOUT } from "../../constants/jobs-constants";
import { JobCard } from "../JobCard";
import { JobCardSkeleton } from "../JobCardSkeleton";

const VIRTUALIZATION_THRESHOLD = 30;

export type JobsListProps = {
  jobs: Job[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
  onFavorite: (job: Job) => void;
  onApply: (job: Job) => void;
  onViewDetails: (job: Job) => void;
  favoritePendingId?: string;
  applyPendingId?: string;
};

export const JobsList = ({
  jobs,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  onLoadMore,
  onFavorite,
  onApply,
  onViewDetails,
  favoritePendingId,
  applyPendingId,
}: JobsListProps) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const useVirtual = jobs.length > VIRTUALIZATION_THRESHOLD;

  const virtualizer = useVirtualizer({
    count: jobs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 320,
    enabled: useVirtual,
    overscan: 4,
  });

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) {
          onLoadMore();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  if (isLoading) {
    return (
      <div className={JOBS_LAYOUT.list}>
        {Array.from({ length: 4 }).map((_, index) => (
          <JobCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!useVirtual) {
    return (
      <div className="space-y-4">
        <div className={JOBS_LAYOUT.list}>
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onFavorite={onFavorite}
              onApply={onApply}
              onViewDetails={onViewDetails}
              isFavoritePending={favoritePendingId === job.id}
              isApplyPending={applyPendingId === job.id}
            />
          ))}
        </div>
        <div ref={loadMoreRef} className="flex justify-center py-4">
          {isFetchingNextPage ? <Muted>Carregando mais vagas...</Muted> : null}
          {hasNextPage && !isFetchingNextPage ? (
            <Button type="button" variant="outline" onClick={onLoadMore}>
              Carregar mais
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div className="space-y-4">
      <div ref={parentRef} className="max-h-[70vh] overflow-auto">
        <div
          className={JOBS_LAYOUT.list}
          style={{ height: virtualizer.getTotalSize(), position: "relative" }}
        >
          {virtualItems.map((virtualRow) => {
            const job = jobs[virtualRow.index];
            if (!job) return null;

            return (
              <div
                key={job.id}
                ref={virtualizer.measureElement}
                data-index={virtualRow.index}
                className="absolute left-0 top-0 w-full pb-4"
                style={{ transform: `translateY(${virtualRow.start}px)` }}
              >
                <JobCard
                  job={job}
                  onFavorite={onFavorite}
                  onApply={onApply}
                  onViewDetails={onViewDetails}
                  isFavoritePending={favoritePendingId === job.id}
                  isApplyPending={applyPendingId === job.id}
                />
              </div>
            );
          })}
        </div>
      </div>
      <div ref={loadMoreRef} className="flex justify-center py-4">
        {isFetchingNextPage ? <Muted>Carregando mais vagas...</Muted> : null}
      </div>
    </div>
  );
};
