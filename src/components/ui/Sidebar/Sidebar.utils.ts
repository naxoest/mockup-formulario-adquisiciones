import { cn } from '@/utils/cn'
import type { SidebarNavItem } from './Sidebar.types'

const ROW_BASE_CLASSES =
  'flex items-center gap-3 overflow-hidden rounded-lg text-start text-sm transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-current'

interface RowClassOptions {
  current: boolean
  collapsed?: boolean
  nested?: boolean
  emphasized?: boolean
}

function rowSizeClasses(collapsed: boolean, nested: boolean): string {
  if (collapsed) return 'min-h-10 w-10 px-2.75'
  if (nested) return 'min-h-8 w-full py-1.5 pr-2.75 pl-10.25 max-lg:min-h-11'
  return 'min-h-9 w-full px-2.75 py-2 max-lg:min-h-11'
}

function rowWeightClass(strong: boolean, nested: boolean): string {
  if (strong) return 'font-semibold'
  return nested ? 'font-normal' : 'font-medium'
}

export function rowClassName({
  current,
  collapsed = false,
  nested = false,
  emphasized = false,
}: RowClassOptions): string {
  return cn(
    ROW_BASE_CLASSES,
    rowSizeClasses(collapsed, nested),
    rowWeightClass(current || emphasized, nested),
    current ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'hover:bg-sidebar-foreground/12',
  )
}

export function resolveActivePath(items: SidebarNavItem[], currentPath: string): string | null {
  const paths = items.flatMap((item) =>
    item.type === 'link' ? [item.path] : item.items.map((child) => child.path),
  )

  return paths.reduce<string | null>((activePath, path) => {
    const matches = currentPath === path || currentPath.startsWith(`${path}/`)
    if (!matches) return activePath
    return activePath === null || path.length > activePath.length ? path : activePath
  }, null)
}

export function formatRoles(roles: string[]): string {
  if (!roles || roles.length === 0) return ''
  if (roles.length === 1) return roles[0]
  if (roles.length === 2) return `${roles[0]} y ${roles[1]}`

  const lastRole = roles[roles.length - 1]
  const otherRoles = roles.slice(0, -1).join(', ')
  return `${otherRoles} y ${lastRole}`
}
