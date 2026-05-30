import {
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getUserThreadsAction } from "../actions/actions";
import { SidebarLinkList } from "@/components/dashboard/sidebar/sidebar-link-list";
import { MessageSquareIcon } from "lucide-react";
import { Suspense } from "react";

export const ThreadListSidebar = async () => {
  return (
    <SidebarGroupContent>
      <SidebarGroupLabel>Threads</SidebarGroupLabel>
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

  const threads = await getUserThreadsAction(userId);

  return threads.length ? (
    <SidebarLinkList
      links={threads.map((thread) => ({
        title: thread.title,
        icon: MessageSquareIcon,
        details: { type: "link", href: `/dashboard/threads/${thread.id}` },
      }))}
    />
  ) : (
    <div className="border-2 border-border border-dashed rounded-md w-full p-5 flex flex-col items-center">
      <span className="text-base font-semibold text-center">
        No Threads Yet
      </span>
      <span className="text-sm text-muted-foreground text-center">
        You haven't created any threads yet.{" "}
      </span>
    </div>
  );
};
