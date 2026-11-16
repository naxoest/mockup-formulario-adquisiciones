import { cn } from '@/utils/cn'
import { SidebarContent } from './SidebarContent'
import { SidebarDrawer } from './SidebarDrawer'
import type { SidebarProps } from './Sidebar.types'

export function Sidebar({
  items,
  mobile,
  collapsed,
  mobileOpen,
  currentPath,
  linkComponent,
  onMobileOpenChange,
  user,
  onLogout,
  onViewProfile,
  header,
  className,
}: SidebarProps) {
  const closeMobile = () => {
    if (mobileOpen) {
      onMobileOpenChange(false)
    }
  }

  const handleViewProfile = () => {
    onViewProfile()
    closeMobile()
  }

  const content = (
    <SidebarContent
      items={items}
      collapsed={collapsed}
      currentPath={currentPath}
      linkComponent={linkComponent}
      user={user}
      onLogout={onLogout}
      onViewProfile={handleViewProfile}
      onAfterNavigate={closeMobile}
      onClose={mobile ? closeMobile : undefined}
      header={header}
    />
  )

  if (mobile) {
    return (
      <SidebarDrawer open={mobileOpen} onClose={closeMobile} className={className}>
        {content}
      </SidebarDrawer>
    )
  }

  return (
    <aside
      className={cn(
        'sticky top-0 z-40 flex h-screen flex-col self-start bg-sidebar text-sidebar-foreground',
        'transition-[width] duration-200 ease-out motion-reduce:transition-none',
        collapsed ? 'w-16' : 'w-64',
        className,
      )}
      aria-label="Navegación principal"
    >
      {content}
    </aside>
  )
}
