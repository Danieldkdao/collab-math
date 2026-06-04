"use client";

import { SearchNotFound } from "@/components/search-not-found";
import { ThreadMembershipTable, ThreadTable } from "@/db/schema";
import { DEFAULT_PAGE } from "@/lib/constants";
import { Loader2Icon } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { getUserThreadMembershipsAction } from "../actions/actions";
import { useThreadMembershipParams } from "../hooks/use-thread-membership-params";
import { ThreadMembershipCard } from "./thread-membership-card";

export const ThreadMembershipsInfiniteCardList = ({
  userId,
  initialThreadMemberships,
  initialHasNextPage,
}: {
  userId: string;
  initialThreadMemberships: (typeof ThreadMembershipTable.$inferSelect & {
    thread: typeof ThreadTable.$inferSelect;
  })[];
  initialHasNextPage: boolean;
}) => {
  const [filters] = useThreadMembershipParams();
  const [threadMemberships, setThreadMemberships] = useState(
    initialThreadMemberships,
  );
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

          const data = await getUserThreadMembershipsAction(userId, {
            ...filters,
            page: nextPage,
          });

          setThreadMemberships((current) => [
            ...current,
            ...data.threadMemberships,
          ]);
          setPage(nextPage);
          setHasNextPage(data.metadata.hasNextPage);
        });
      },
      {
        rootMargin: "400px",
      },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [filters, page, hasNextPage, isPending, userId]);

  return threadMemberships.length ? (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 w-full">
        {threadMemberships.map((membership) => (
          <ThreadMembershipCard
            key={membership.threadId}
            threadMembershipData={membership}
          />
        ))}
      </div>
      <div ref={sentinelRef} className="flex justify-center py-6">
        {isPending && (
          <Loader2Icon className="animate-spin text-muted-foreground" />
        )}
      </div>
    </div>
  ) : (
    <SearchNotFound subject="thread memberships" />
  );
};
