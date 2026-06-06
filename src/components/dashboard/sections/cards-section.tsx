import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboardCardData } from "@/lib/actions";
import { cn } from "@/lib/utils";
import {
  BoxIcon,
  ClockIcon,
  MessagesSquareIcon,
  UsersIcon,
} from "lucide-react";
import { Suspense } from "react";

export const CardsSection = () => {
  return (
    <Suspense fallback={<CardsSectionLoading />}>
      <CardsSectionSuspense />
    </Suspense>
  );
};

const CardsSectionLoading = () => {
  return (
    <div className="grid grid-cols-1 @xl:grid-cols-2 @2xl:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index}>
          <CardContent className="flex items-center gap-4 flex-wrap">
            <Skeleton className="size-14 shrink-0 rounded-md" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-9 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const CardsSectionSuspense = async () => {
  const cardData = await getDashboardCardData();
  if (!cardData) return null;

  const cards = [
    {
      label: "THREADS",
      icon: MessagesSquareIcon,
      data: cardData.threadCount,
      bgColor: "bg-primary/30",
      textColor: "text-primary",
    },
    {
      label: "MATH PROBLEMS",
      icon: BoxIcon,
      data: cardData.mathProblemCount,
      bgColor: "bg-secondary/30",
      textColor: "text-secondary",
    },
    {
      label: "COLLABORATORS",
      icon: UsersIcon,
      data: cardData.collaboratorCount,
      bgColor: "bg-destructive/30",
      textColor: "text-destructive",
    },
    {
      label: "PENDING INVITES",
      icon: ClockIcon,
      data: cardData.threadMembershipCount,
      bgColor: "bg-warning/30",
      textColor: "text-warning",
    },
  ];

  return (
    <div className="grid grid-cols-1 @xl:grid-cols-2 @2xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="flex items-center gap-4 flex-wrap">
            <div
              className={cn(
                "size-14 flex items-center justify-center rounded-md shrink-0",
                card.bgColor,
              )}
            >
              <card.icon className={cn("size-8", card.textColor)} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-lg font-medium text-muted-foreground">
                {card.label}
              </span>
              <span className="text-3xl font-semibold">{card.data}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
