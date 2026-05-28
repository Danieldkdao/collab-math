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

type SidebarLink = {
  title: string;
  icon: LucideIcon;
  href: string;
};

const quickActionLinks: SidebarLink[] = [
  {
    title: "New Thread",
    icon: MessageSquarePlusIcon,
    href: "/dashboard/threads/create",
  },
  {
    title: "New Math Problem",
    icon: SquareFunctionIcon,
    href: "/dashboard/math-problems/create",
  },
];

const sidebarLinks: SidebarLink[] = [
  {
    title: "Threads",
    icon: MessageSquareTextIcon,
    href: "/dashboard/threads",
  },
  {
    title: "Math Problems",
    icon: SquareSigmaIcon,
    href: "/dashboard/math-problems",
  },
  {
    title: "Collaborators",
    icon: UsersRoundIcon,
    href: "/dashboard/collaborators",
  },
];

const SidebarLinkList = ({ links }: { links: SidebarLink[] }) => (
  <SidebarMenu>
    {links.map((link) => {
      const Icon = link.icon;

      return (
        <SidebarMenuItem key={link.title}>
          <SidebarMenuButton asChild tooltip={link.title}>
            <Link href={link.href}>
              <Icon />
              <span>{link.title}</span>
            </Link>
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
