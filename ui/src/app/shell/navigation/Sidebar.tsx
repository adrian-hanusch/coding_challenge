import { cn } from '@heroui/react'
import { Brand } from '../Brand.tsx'
import { NavList } from './NavList.tsx'
import { useNavigationStore } from './navigationStore.ts'
import { SidebarToggle } from './SidebarToggle.tsx'

const SIDEBAR_ID = 'app-sidebar'

export function Sidebar() {
  const collapsed = useNavigationStore((state) => state.sidebarCollapsed)
  const toggleSidebar = useNavigationStore((state) => state.toggleSidebar)

  return (
    <aside
      id={SIDEBAR_ID}
      data-collapsed={collapsed}
      data-testid="app-sidebar"
      className={cn(
        'sticky top-0 flex h-svh shrink-0 flex-col border-r border-separator bg-surface',
        'transition-[width] duration-200 ease-out motion-reduce:transition-none',
        collapsed ? 'w-16 px-2' : 'w-64 px-3',
      )}
    >
      <div className={cn('flex h-14 items-center gap-3', collapsed ? 'justify-center' : 'px-3')}>
        <Brand showTitle={!collapsed} />
      </div>
      <div className="mt-2 flex-1 overflow-y-auto">
        <NavList collapsed={collapsed} />
      </div>
      <div className={cn('flex py-3', collapsed ? 'justify-center' : 'justify-end')}>
        <SidebarToggle collapsed={collapsed} onToggle={toggleSidebar} controlsId={SIDEBAR_ID} />
      </div>
    </aside>
  )
}
