import { create } from "zustand";

type PendingActionStoreType = {
  isPending: boolean;
  setIsPending: (bool: boolean) => void;
};

export const usePendingActionStore = create<PendingActionStoreType>((set) => ({
  isPending: false,
  setIsPending: (bool) => set({ isPending: bool }),
}));
