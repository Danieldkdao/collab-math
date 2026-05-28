import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ReactNode } from "react";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="w-full h-dvh flex">
      <SidebarProvider>
        <DashboardSidebar />
        <div className="flex flex-col h-full flex-1 w-full">
          <DashboardHeader />
          <div className="flex-1 w-full h-full">
            <div className="mx-auto w-full max-w-7xl py-10">{children}</div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default DashboardLayout;
