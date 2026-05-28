import { ReactNode } from "react";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="w-full h-svh flex items-center justify-center py-10 px-6 overflow-auto">
      <div className="w-full max-w-120">{children}</div>
    </div>
  );
};

export default AuthLayout;
