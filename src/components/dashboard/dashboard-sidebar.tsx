import {
  MessageSquarePlusIcon,
  MessageSquareTextIcon,
  SquareFunctionIcon,
  SquareSigmaIcon,
  UsersRoundIcon,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import { DashboardSidebarUserProfile } from "./dashboard-sidebar-user-profile";
import { ReactNode } from "react";
import { CreateMathProblemDialog } from "@/features/math-problems/components/create-math-problem-dialog";

type SidebarLink = {
  title: string;
  icon: LucideIcon;
  details:
    | {
        type: "link";
        href: string;
      }
    | {
        type: "button";
        action?: () => void;
        children?: ReactNode;
      };
};

const quickActionLinks: SidebarLink[] = [
  {
    title: "New Thread",
    icon: MessageSquarePlusIcon,
    details: {
      type: "link",
      href: "/dashboard/threads/create",
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
      href: "/dashboard/threads",
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
];

const SidebarLinkList = ({ links }: { links: SidebarLink[] }) => (
  <SidebarMenu>
    {links.map((link) => {
      const Icon = link.icon;

      return (
        <SidebarMenuItem key={link.title}>
          <SidebarMenuButton asChild tooltip={link.title}>
            {link.details.type === "link" ? (
              <Link href={link.details.href}>
                <Icon />
                <span>{link.title}</span>
              </Link>
            ) : (
              link.details.children
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    })}
  </SidebarMenu>
);

export const DashboardSidebar = () => {
  return (
    <Sidebar>
      <SidebarHeader className="pt-4 px-4">
        <h1 className="text-3xl font-semibold text-primary">CollabMath</h1>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarGroupContent>
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarLinkList links={quickActionLinks} />
        </SidebarGroupContent>
        <SidebarGroupContent>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarLinkList links={sidebarLinks} />
        </SidebarGroupContent>
      </SidebarContent>
      <SidebarFooter>
        <DashboardSidebarUserProfile />
      </SidebarFooter>
    </Sidebar>
  );
};
