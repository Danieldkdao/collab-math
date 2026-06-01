import { CreateMathProblemDialog } from "@/features/math-problems/components/create-math-problem-dialog";
import { SidebarLink } from "@/lib/types";
import {
  LockIcon,
  MessageSquarePlusIcon,
  MessageSquareTextIcon,
  SquareFunctionIcon,
  SquareSigmaIcon,
  UsersRoundIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenuButton,
} from "../../ui/sidebar";
import { DashboardSidebarUserProfile } from "./dashboard-sidebar-user-profile";
import { SidebarLinkList } from "./sidebar-link-list";
import { ThreadListSidebar } from "@/features/threads/components/thread-list-sidebar";
import { CreateThreadDialog } from "@/features/threads/components/create-thread-dialog";
import Link from "next/link";
import { THREADS_PATH } from "@/features/threads/lib/routes";

const quickActionLinks: SidebarLink[] = [
  {
    title: "New Thread",
    icon: MessageSquarePlusIcon,
    details: {
      type: "button",
      children: (
        <CreateThreadDialog>
          <SidebarMenuButton className="cursor-pointer">
            <MessageSquarePlusIcon />
            <span>New Thread</span>
          </SidebarMenuButton>
        </CreateThreadDialog>
      ),
    },
  },
  {
    title: "New Math Problem",
    icon: SquareFunctionIcon,
    details: {
      type: "button",
      children: (
        <CreateMathProblemDialog>
          <SidebarMenuButton className="cursor-pointer">
            <SquareFunctionIcon />
            <span>New Math Problem</span>
          </SidebarMenuButton>
        </CreateMathProblemDialog>
      ),
    },
  },
];

const sidebarLinks: SidebarLink[] = [
  {
    title: "Threads",
    icon: MessageSquareTextIcon,
    details: {
      type: "link",
      href: THREADS_PATH,
    },
  },
  {
    title: "Math Problems",
    icon: SquareSigmaIcon,
    details: {
      type: "link",
      href: "/dashboard/math-problems",
    },
  },
  {
    title: "Collaborators",
    icon: UsersRoundIcon,
    details: {
      type: "link",
      href: "/dashboard/collaborators",
    },
  },
  {
    title: "Memberships",
    icon: LockIcon,
    details: {
      type: "link",
      href: "/dashboard/memberships",
    },
  },
];

export const DashboardSidebar = () => {
  return (
    <Sidebar>
      <SidebarHeader className="pt-4 px-4">
        <Link href="/dashboard">
          <h1 className="text-3xl font-semibold text-primary">CollabMath</h1>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarGroupContent>
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarLinkList links={quickActionLinks} />
        </SidebarGroupContent>
        <SidebarGroupContent>
          <SidebarGroupLabel>Data</SidebarGroupLabel>
          <SidebarLinkList links={sidebarLinks} />
        </SidebarGroupContent>
        <ThreadListSidebar />
      </SidebarContent>
      <SidebarFooter>
        <DashboardSidebarUserProfile />
      </SidebarFooter>
    </Sidebar>
  );
};
