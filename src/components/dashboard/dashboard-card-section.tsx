import { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { cn } from "@/lib/utils";

export const DashboardCardSection = ({
  children,
  headerChildren,
  className,
  headerClassName,
}: {
  children: ReactNode;
  headerChildren: ReactNode;
  className?: string;
  headerClassName?: string;
}) => {
  return (
    <Card className="p-0 gap-0">
      <CardHeader
        className={cn(
          "border-b flex items-center gap-2 justify-between flex-wrap bg-background dark:bg-muted p-5!",
          headerClassName,
        )}
      >
        {headerChildren}
      </CardHeader>
      <CardContent className={cn("p-0", className)}>{children}</CardContent>
    </Card>
  );
};
