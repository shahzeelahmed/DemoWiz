import { create } from "zustand";

interface sidebarStore{
  selectedIcon: string,
  setSelectedIcon: (icon: string) => void
  }
  const useSidebarStore = create<sidebarStore>((set) => ({
    selectedIcon: 'video',
    setSelectedIcon: (icon: string) =>
      set(() => {
        return { selectedIcon: icon };
      }),
  }));

  export default useSidebarStore;