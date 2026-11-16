import type { ComponentType, ReactNode, Ref } from 'react'

export type SidebarIcon = ComponentType<{ size?: number | string; className?: string }>

export type SidebarLinkItem = {
  type: 'link'
  icon: SidebarIcon
  label: string
  path: string
}

export type SidebarGroupItem = {
  type: 'group'
  icon: SidebarIcon
  label: string
  items: Array<{ label: string; path: string }>
}

export type SidebarNavItem = SidebarLinkItem | SidebarGroupItem

export type SidebarAriaCurrent = 'page' | 'true'

export interface SidebarLinkProps {
  to: string
  className?: string
  onClick?: () => void
  'aria-current'?: SidebarAriaCurrent | undefined
  'aria-label'?: string
  ref?: Ref<HTMLAnchorElement>
  children: ReactNode
}

export type SidebarLinkComponent = ComponentType<SidebarLinkProps>

export interface SidebarUser {
  displayName: string
  initials: string
  avatarSeed?: string | number
  avatarUrl?: string
  roles: string[]
}

export interface SidebarProps {
  items: SidebarNavItem[]
  mobile: boolean
  collapsed: boolean
  mobileOpen: boolean
  currentPath: string
  linkComponent: SidebarLinkComponent
  onMobileOpenChange: (open: boolean) => void
  user: SidebarUser
  onLogout: () => void
  onViewProfile: () => void
  header?: ReactNode
  className?: string
}
