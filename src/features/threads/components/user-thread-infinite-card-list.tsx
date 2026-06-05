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
import { useEffect, useRef, useState, useTransition } from "react";
import { getUserThreadsAction } from "../actions/actions";
import { useThreadParams } from "../hooks/use-thread-params";
import { ThreadCard } from "./thread-card";
import { User } from "@/lib/auth/auth";

export const UserThreadInfiniteCardList = ({
  userId,
  initialThreads,
  initialHasNextPage,
}: {
  userId: string;
  initialThreads: (typeof ThreadTable.$inferSelect & {
    mathProblems: (typeof ThreadMathProblemTable.$inferSelect & {
      mathProblem: typeof MathProblemTable.$inferSelect;
    })[];
    memberships: (typeof ThreadMembershipTable.$inferSelect & { user: User })[];
    totalCollaborators: number;
    totalComments: number;
  })[];
  initialHasNextPage: boolean;
}) => {
  const [filters] = useThreadParams();
  const [threads, setThreads] = useState(initialThreads);
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [isPending, startTransition] = useTransition();
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage || isPending) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        startTransition(async () => {
          const nextPage = page + 1;

          const { threads, metadata } = await getUserThreadsAction(userId, {
            page: nextPage,
            ...filters,
          });

          setThreads((prev) => [...prev, ...threads]);
          setPage(nextPage);
          setHasNextPage(metadata.hasNextPage);
        });
      },
      {
        rootMargin: "400px",
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filters, page, hasNextPage, isPending, userId]);

  return threads.length ? (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 w-full">
        {threads.map((thread) => (
          <ThreadCard key={thread.id} thread={thread} />
        ))}
      </div>
      <div ref={sentinelRef} className="flex justify-center py-6">
        {isPending && (
          <Loader2Icon className="animate-spin text-muted-foreground" />
        )}
      </div>
    </div>
  ) : (
    <SearchNotFound subject="threads" />
  );
};
