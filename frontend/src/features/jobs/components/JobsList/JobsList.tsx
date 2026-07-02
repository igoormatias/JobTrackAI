"use client";

import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

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
  onOpenJob: (job: Job) => void;
  onAddToPipeline: (job: Job) => void;
  onViewDetails: (job: Job) => void;
  favoritePendingId?: string;
};

export const JobsList = ({
  jobs,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  onLoadMore,
  onFavorite,
  onOpenJob,
  onAddToPipeline,
  onViewDetails,
  favoritePendingId,
}: JobsListProps) => {
  const listRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [scrollMargin, setScrollMargin] = useState(0);
  const useVirtual = jobs.length > VIRTUALIZATION_THRESHOLD;

  useLayoutEffect(() => {
    if (!useVirtual || !listRef.current) return;

    const updateScrollMargin = () => {
      if (listRef.current) {
        setScrollMargin(listRef.current.offsetTop);
      }
    };

    updateScrollMargin();
    window.addEventListener("resize", updateScrollMargin);

    return () => window.removeEventListener("resize", updateScrollMargin);
  }, [useVirtual, jobs.length]);

  const virtualizer = useWindowVirtualizer({
    count: useVirtual ? jobs.length : 0,
    estimateSize: () => 320,
    overscan: 4,
    scrollMargin,
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
              onOpenJob={onOpenJob}
              onAddToPipeline={onAddToPipeline}
              onViewDetails={onViewDetails}
              isFavoritePending={favoritePendingId === job.id}
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
      <div
        ref={listRef}
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
              style={{ transform: `translateY(${virtualRow.start - scrollMargin}px)` }}
            >
              <JobCard
                job={job}
                onFavorite={onFavorite}
                onOpenJob={onOpenJob}
                onAddToPipeline={onAddToPipeline}
                onViewDetails={onViewDetails}
                isFavoritePending={favoritePendingId === job.id}
              />
            </div>
          );
        })}
      </div>
      <div ref={loadMoreRef} className="flex justify-center py-4">
        {isFetchingNextPage ? <Muted>Carregando mais vagas...</Muted> : null}
      </div>
    </div>
  );
};
