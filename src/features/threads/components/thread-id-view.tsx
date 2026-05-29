import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";
import { TooltipWrapper } from "@/components/tooltip-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAvatar } from "@/components/user-avatar";
import { ThreadTable, user } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { EditIcon } from "lucide-react";

export const ThreadIdView = async ({
  thread,
}: {
  thread: typeof ThreadTable.$inferSelect & { user: typeof user.$inferSelect };
}) => {
  const { userId } = await getCurrentUser();

  return (
    <div className="w-full min-w-0">
      <Card>
        <CardContent className="flex flex-col gap-4 min-w-0">
          <div className="flex flex-col gap-2 min-w-0">
            <div className="flex items-center w-full min-w-0">
              <h1 className="text-3xl font-semibold flex-1 truncate">
                {thread.title}
              </h1>
              {userId === thread.user.id && (
                <TooltipWrapper content="Edit thread">
                  <Button variant="outline" size="icon">
                    <EditIcon />
                  </Button>
                </TooltipWrapper>
              )}
            </div>

            <div className="flex items-center gap-2">
              <UserAvatar {...thread.user} />
              <span className="text-base">
                <span className="font-medium">{thread.user.name}</span> started
                this thread on {thread.createdAt.toDateString()}
              </span>
            </div>
          </div>
          <Tabs defaultValue="description">
            <TabsList className="w-full">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="conversations">Conversations</TabsTrigger>
            </TabsList>
            <TabsContent value="description">
              <MarkdownRenderer>{thread.description}</MarkdownRenderer>
            </TabsContent>
            <TabsContent value="conversations"></TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
