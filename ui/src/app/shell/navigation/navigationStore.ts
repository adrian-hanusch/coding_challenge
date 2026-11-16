import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface NavigationState {
  sidebarCollapsed: boolean
  toggleSidebar: () => void
}

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: 'app.navigation',
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
      merge: (persisted, current) => {
        const sidebarCollapsed = (persisted as Partial<NavigationState> | undefined)?.sidebarCollapsed
        return typeof sidebarCollapsed === 'boolean' ? { ...current, sidebarCollapsed } : current
      },
    },
  ),
)
