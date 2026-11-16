import { useEffect, useRef, type ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { SidebarGroup } from './SidebarGroup'
import { SidebarHeader } from './SidebarHeader'
import { SidebarItem } from './SidebarItem'
import { SidebarUserCard } from './SidebarUserCard'
import { resolveActivePath } from './Sidebar.utils'
import type {
  SidebarAriaCurrent,
  SidebarLinkComponent,
  SidebarNavItem,
  SidebarUser,
} from './Sidebar.types'

interface SidebarContentProps {
  items: SidebarNavItem[]
  collapsed: boolean
  currentPath: string
  linkComponent: SidebarLinkComponent
  user: SidebarUser
  onLogout: () => void
  onViewProfile: () => void
  onAfterNavigate: () => void
  onClose?: (() => void) | undefined
  header?: ReactNode
}

export function SidebarContent({
  items,
  collapsed,
  currentPath,
  linkComponent,
  user,
  onLogout,
  onViewProfile,
  onAfterNavigate,
  onClose,
  header,
}: SidebarContentProps) {
  const navRef = useRef<HTMLElement>(null)
  const activePath = resolveActivePath(items, currentPath)
  const ariaCurrent: SidebarAriaCurrent = activePath === currentPath ? 'page' : 'true'

  useEffect(() => {
    navRef.current?.querySelector('[aria-current]')?.scrollIntoView({ block: 'nearest' })
  }, [activePath])

  return (
    <>
      <SidebarHeader
        collapsed={collapsed}
        header={header}
        linkComponent={linkComponent}
        onAfterNavigate={onAfterNavigate}
        onClose={onClose}
      />

      <nav
        ref={navRef}
        className={cn(
          'flex-1 overflow-x-hidden overflow-y-auto overscroll-contain p-3',
          '[scrollbar-color:color-mix(in_oklab,var(--color-sidebar-foreground)_30%,transparent)_transparent]',
          collapsed ? '[scrollbar-width:none]' : '[scrollbar-width:thin]',
        )}
      >
        <ul className={cn('flex flex-col gap-0.5', !collapsed && 'min-w-55')}>
          {items.map((item) => {
            if (item.type === 'group') {
              return (
                <SidebarGroup
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  items={item.items}
                  collapsed={collapsed}
                  activePath={activePath}
                  ariaCurrent={ariaCurrent}
                  linkComponent={linkComponent}
                  onAfterNavigate={onAfterNavigate}
                />
              )
            }

            return (
              <SidebarItem
                key={item.path}
                icon={item.icon}
                label={item.label}
                path={item.path}
                collapsed={collapsed}
                ariaCurrent={item.path === activePath ? ariaCurrent : undefined}
                linkComponent={linkComponent}
                onAfterNavigate={onAfterNavigate}
              />
            )
          })}
        </ul>
      </nav>

      <SidebarUserCard
        user={user}
        isOpen={!collapsed}
        onLogout={onLogout}
        onViewProfile={onViewProfile}
      />
    </>
  )
}
