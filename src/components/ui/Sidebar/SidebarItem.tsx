import { Tooltip } from '@/components/ui/Tooltip'
import { cn } from '@/utils/cn'
import { rowClassName } from './Sidebar.utils'
import type { SidebarAriaCurrent, SidebarIcon, SidebarLinkComponent } from './Sidebar.types'

interface SidebarItemProps {
  icon: SidebarIcon
  label: string
  path: string
  collapsed: boolean
  ariaCurrent: SidebarAriaCurrent | undefined
  linkComponent: SidebarLinkComponent
  onAfterNavigate: () => void
}

export function SidebarItem({
  icon: Icon,
  label,
  path,
  collapsed,
  ariaCurrent,
  linkComponent: LinkComponent,
  onAfterNavigate,
}: SidebarItemProps) {
  const link = (
    <LinkComponent
      to={path}
      onClick={onAfterNavigate}
      className={rowClassName({ current: ariaCurrent !== undefined, collapsed })}
      aria-current={ariaCurrent}
    >
      <Icon size={18} className="shrink-0" />
      <span className={cn('min-w-0 flex-1 break-words', collapsed && 'sr-only')}>{label}</span>
    </LinkComponent>
  )

  return (
    <li>
      {collapsed ? (
        <Tooltip content={label} role="label" placement="right">
          {link}
        </Tooltip>
      ) : (
        link
      )}
    </li>
  )
}
