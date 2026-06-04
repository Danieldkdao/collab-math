"use client";

import { User } from "@/lib/auth/auth";
import { useCollaboratorParams } from "../hooks/use-collaborator-params";
import { useEffect, useRef, useState, useTransition } from "react";
import { DEFAULT_PAGE } from "@/lib/constants";
import { getCollaboratorsAction } from "../actions/actions";
import { SearchNotFound } from "@/components/search-not-found";
import { Loader2Icon } from "lucide-react";
import { CollaboratorCard } from "./collaborator-card";

export const CollaboratorInfiniteCardList = ({
  initialCollaborators,
  initialHasNextPage,
  userId,
}: {
  initialCollaborators: {
    collaboratorId: string;
    user: User;
    totalCollaborations: number;
  }[];
  initialHasNextPage: boolean;
  userId: string;
}) => {
  const [filters] = useCollaboratorParams();
  const [collaborators, setCollaborators] = useState(initialCollaborators);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [isPending, startTransition] = useTransition();
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || isPending || !hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        startTransition(async () => {
          const nextPage = page + 1;

          const { collaborators, metadata } = await getCollaboratorsAction(
            userId,
            { ...filters, page: nextPage },
          );
          setCollaborators((prev) => [...prev, ...collaborators]);
          setHasNextPage(metadata.hasNextPage);
          setPage(nextPage);
        });
      },
      {
        rootMargin: "400px",
      },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [filters, page, hasNextPage, isPending, userId]);

  return collaborators.length ? (
    <div className="space-y-6 w-full">
      <div className="grid grid-cols-1 @lg:grid-cols-2 gap-4 w-full">
        {collaborators.map((collaborator) => (
          <CollaboratorCard
            key={collaborator.collaboratorId}
            collaborator={collaborator}
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
    <SearchNotFound subject="collaborators" />
  );
};
