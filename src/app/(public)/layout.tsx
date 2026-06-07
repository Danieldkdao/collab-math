import { PublicFooter } from "@/components/public/footer";
import { PublicNavbar } from "@/components/public/navbar";
import { ReactNode } from "react";

const PublicLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex flex-col w-full min-h-dvh">
      <PublicNavbar />
      <main className="w-full flex-1 mx-auto max-w-7xl py-20 px-6">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
};

export default PublicLayout;
