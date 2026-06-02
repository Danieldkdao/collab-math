import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreateThreadDialog } from "@/features/threads/components/create-thread-dialog";
import { getUserSidebarThreadsAction } from "@/features/threads/actions/actions";
import { getThreadPath } from "@/features/threads/lib/routes";
import { getCurrentUser } from "@/lib/auth/helpers";
import { ArrowRightIcon, MessageSquarePlusIcon } from "lucide-react";
import Link from "next/link";

const ThreadsPage = async () => {
  const { userId } = await getCurrentUser();
  if (!userId) return null;

  const threads = await getUserSidebarThreadsAction(userId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-4xl font-semibold">Threads</h1>
        <CreateThreadDialog>
          <Button>
            <MessageSquarePlusIcon />
            New Thread
          </Button>
        </CreateThreadDialog>
      </div>

      {threads.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {threads.map((thread) => (
            <Card key={thread.id}>
              <CardContent className="flex h-full flex-col gap-4">
                <div className="flex-1">
                  <MarkdownRenderer variant="title">
                    {thread.title}
                  </MarkdownRenderer>
                  {thread.description && (
                    <p className="mt-2 line-clamp-3 text-base text-muted-foreground">
                      {thread.description}
                    </p>
                  )}
                </div>
                <Button asChild className="w-full">
                  <Link href={getThreadPath(thread.id)}>
                    Open Thread
                    <ArrowRightIcon />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-md border-2 border-dashed border-border p-8 text-center">
          <h2 className="text-xl font-semibold">No Threads Yet</h2>
          <p className="mt-1 text-base text-muted-foreground">
            Create your first thread to start collaborating on math problems.
          </p>
        </div>
      )}
    </div>
  );
};

export default ThreadsPage;
