import {
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getUserSidebarThreadsAction } from "../actions/actions";
import { SidebarLinkList } from "@/components/layout/sidebar/sidebar-link-list";
import { MessageSquareIcon } from "lucide-react";
import { Suspense } from "react";
import { getThreadPath } from "../lib/routes";
import Link from "next/link";

export const ThreadListSidebar = async () => {
  return (
    <SidebarGroupContent>
      <div className="flex items-center gap-2 justify-between">
        <SidebarGroupLabel>Recent Threads</SidebarGroupLabel>
        <Link
          href="/dashboard/threads"
          className="text-xs font-medium cursor-pointer text-muted-foreground hover:underline mr-2"
        >
          View all
        </Link>
      </div>

      <Suspense fallback={<ThreadListSidebarLoading />}>
        <ThreadListSidebarSuspense />
      </Suspense>
    </SidebarGroupContent>
  );
};

const ThreadListSidebarLoading = () => {
  return <div>loading</div>;
};

const ThreadListSidebarSuspense = async () => {
  const { userId } = await getCurrentUser();
  if (!userId) return null;

  const threads = await getUserSidebarThreadsAction(userId);

  return threads.length ? (
    <SidebarLinkList
      links={threads.map((thread) => ({
        title: thread.title,
        icon: MessageSquareIcon,
        details: { type: "link", href: getThreadPath(thread.id) },
      }))}
    />
  ) : (
    <div className="border-2 border-border border-dashed rounded-md w-full p-5 flex flex-col items-center">
      <span className="text-base font-semibold text-center">
        No Threads Yet
      </span>
      <span className="text-sm text-muted-foreground text-center">
        You haven&apos;t created any threads yet.{" "}
      </span>
    </div>
  );
};
