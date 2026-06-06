import { cn } from "@/lib/utils";
import { SearchXIcon } from "lucide-react";

export const DashboardNoData = ({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) => {
  return (
    <div className={cn("p-5 flex flex-col items-center gap-2", className)}>
      <SearchXIcon className="size-10" />
      <h2 className="text-2xl font-semibold text-center">{title}</h2>
      <p className="text-muted-foreground text-center max-w-150 w-full text-lg">
        {description}
      </p>
    </div>
  );
};
