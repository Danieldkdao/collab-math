"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useThreadMembershipParams } from "../hooks/use-thread-membership-params";
import { ThreadMembershipCard } from "./thread-membership-card";
import { Loader2Icon, SearchXIcon } from "lucide-react";
import { ThreadMembershipTable, ThreadTable } from "@/db/schema";
import { getUserThreadMembershipsAction } from "../actions/actions";
import { DEFAULT_PAGE } from "@/lib/constants";

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
    setThreadMemberships(initialThreadMemberships);
    setHasNextPage(initialHasNextPage);
  }, [initialThreadMemberships, initialHasNextPage]);

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
  }, [filters, page, hasNextPage, isPending]);

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
    <div className="w-full py-10 px-6 flex flex-col items-center justify-center gap-2 bg-card/50 rounded-md border-4 border-border border-dashed">
      <SearchXIcon className="size-10" />
      <h2 className="text-2xl font-semibold text-center">
        No Thread Memberships Found
      </h2>
      <p className="text-lg text-muted-foreground max-w-150 text-center">
        We were unable to find any thread memberships that match the current
        filters. Try adjusting the search terms or changing the filter options.
      </p>
    </div>
  );
};
