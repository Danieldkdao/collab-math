import { create } from "zustand";

type ThreadMembershipActionStoreType = {
  isPending: boolean;
  setIsPending: (bool: boolean) => void;
};

export const useThreadMembershipActionStore =
  create<ThreadMembershipActionStoreType>((set) => ({
    isPending: false,
    setIsPending: (bool) => set({ isPending: bool }),
  }));
