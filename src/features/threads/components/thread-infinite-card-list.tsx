"use client";

import { SearchNotFound } from "@/components/search-not-found";
import {
  MathProblemTable,
  ThreadMathProblemTable,
  ThreadMembershipTable,
  ThreadTable,
} from "@/db/schema";
import { DEFAULT_PAGE } from "@/lib/constants";
import { Loader2Icon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { getThreadsAction } from "../actions/actions";
import { useThreadParams } from "../hooks/use-thread-params";
import { ThreadCard } from "./thread-card";
import { User } from "@/lib/auth/auth";

export const ThreadInfiniteCardList = ({
  userId,
  initialThreads,
  initialHasNextPage,
  publicThreads = false,
}: {
  userId?: string | null;
  initialThreads: (typeof ThreadTable.$inferSelect & {
    mathProblems: (typeof ThreadMathProblemTable.$inferSelect & {
      mathProblem: typeof MathProblemTable.$inferSelect;
    })[];
    memberships: (typeof ThreadMembershipTable.$inferSelect & { user: User })[];
    totalCollaborators: number;
    totalComments: number;
  })[];
  initialHasNextPage: boolean;
  publicThreads?: boolean;
}) => {
  const [filters] = useThreadParams();
  const [threads, setThreads] = useState(initialThreads);
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const isLoadingMoreRef = useRef(false);

  const loadMoreThreads = useCallback(async () => {
    if (isLoadingMoreRef.current || !hasNextPage) return;

    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);

    const nextPage = page + 1;

    try {
      const { threads, metadata } = await getThreadsAction(
        {
          page: nextPage,
          ...filters,
        },
        userId,
        publicThreads,
      );

      setThreads((prev) => [...prev, ...threads]);
      setPage(nextPage);
      setHasNextPage(metadata.hasNextPage);
    } finally {
      isLoadingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  }, [filters, hasNextPage, page, publicThreads, userId]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        void loadMoreThreads();
      },
      {
        rootMargin: "400px",
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, loadMoreThreads]);

  return threads.length ? (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 w-full">
        {threads.map((thread) => (
          <ThreadCard key={thread.id} thread={thread} currentUserId={userId} />
        ))}
      </div>
      <div ref={sentinelRef} className="flex justify-center py-6">
        {isLoadingMore && (
          <Loader2Icon className="animate-spin text-muted-foreground" />
        )}
      </div>
    </div>
  ) : (
    <SearchNotFound subject="threads" />
  );
};
