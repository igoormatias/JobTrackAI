import { create } from "zustand";

type AppStore = {
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleSidebarCollapsed: () => void;
};

export const useAppStore = create<AppStore>((set) => ({
  isSidebarOpen: false,
  isSidebarCollapsed: false,
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  toggleSidebarCollapsed: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
}));
