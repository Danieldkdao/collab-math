import { LucideIcon } from "lucide-react";
import { Dispatch, ReactNode, SetStateAction } from "react";

export type SetterType<T> = Dispatch<SetStateAction<T>>;

export type ParamsType<T extends keyof any> = {
  params: Promise<Record<T, string>>;
};

export type SidebarLink = {
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
