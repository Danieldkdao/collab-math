import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { MathProblemTable } from "@/db/schema";
import {
  CalendarIcon,
  ChevronDownIcon,
  FunctionSquareIcon,
  MessagesSquareIcon,
  RefreshCwIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

export const MathProblemCard = ({
  mathProblem,
}: {
  mathProblem: typeof MathProblemTable.$inferSelect & {
    totalUsageInThreads: number;
  };
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-6 border-b">
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <FunctionSquareIcon className="hidden md:inline size-6 shrink-0" />
          <MarkdownRenderer className="min-w-0 [&_h1]:mt-0 [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:leading-tight [&_h1]:wrap-break-word [&_h1]:whitespace-normal [&_p]:my-0 [&_p]:text-3xl [&_p]:font-semibold [&_p]:leading-tight [&_p]:wrap-break-word [&_p]:whitespace-normal">
            {mathProblem.title}
          </MarkdownRenderer>

          <Badge variant="outline" className="shrink-0">
            <MessagesSquareIcon />
            Used in {mathProblem.totalUsageInThreads}{" "}
            {mathProblem.totalUsageInThreads === 1 ? "thread" : "threads"}
          </Badge>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <CalendarIcon className="text-muted-foreground" />
            <span className="text-muted-foreground font-medium text-lg">
              Created: {mathProblem.createdAt.toDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCwIcon className="text-muted-foreground" />
            <span className="text-muted-foreground font-medium text-lg">
              Updated:{" "}
              {formatDistanceToNow(mathProblem.updatedAt, { addSuffix: true })}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Collapsible className="flex flex-col gap-4">
          <CollapsibleTrigger className="group cursor-pointer w-full flex items-center gap-2 justify-between">
            <span className="text-lg font-medium">
              Show/Hide problem content
            </span>
            <ChevronDownIcon className="group-data-[state=open]:rotate-180 transition-transform duration-300" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <MarkdownRenderer>{mathProblem.content}</MarkdownRenderer>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
      <CardFooter className="flex items-center gap-2 justify-end border-t">
        <Button variant="outline">Update</Button>
        <Button variant="destructive">Delete</Button>
      </CardFooter>
    </Card>
  );
};
