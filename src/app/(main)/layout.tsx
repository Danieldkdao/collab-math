import { DashboardHeader } from "@/components/dashboard/layout/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard/layout/sidebar/dashboard-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ReactNode } from "react";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="w-full h-dvh flex">
      <SidebarProvider>
        <DashboardSidebar />
        <div className="flex flex-col h-full flex-1 w-full overflow-hidden">
          <DashboardHeader />
          <div className="flex-1 w-full h-full overflow-y-auto">
            <div className="mx-auto w-full max-w-7xl py-10 px-6 @container">
              {children}
            </div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default DashboardLayout;
