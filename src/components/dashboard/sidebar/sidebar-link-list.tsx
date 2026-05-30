import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SidebarLink } from "@/lib/types";
import Link from "next/link";

export const SidebarLinkList = ({ links }: { links: SidebarLink[] }) => (
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
