import { ThemeToggle } from "../theme-toggle";
import { SidebarTrigger } from "../ui/sidebar";

export const DashboardHeader = () => {
  return (
    <header className="w-full border-b bg-sidebar p-4 flex items-center gap-2 justify-between">
      <SidebarTrigger />
      <ThemeToggle />
    </header>
  );
};
