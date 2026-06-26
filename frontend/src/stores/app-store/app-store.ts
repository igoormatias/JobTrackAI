import { create } from "zustand";

type AppStore = {
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
};

export const useAppStore = create<AppStore>((set) => ({
  isSidebarOpen: false,
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
}));
