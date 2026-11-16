import { useId, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'
import { SidebarFlyout } from './SidebarFlyout'
import { rowClassName } from './Sidebar.utils'
import type { SidebarAriaCurrent, SidebarGroupItem, SidebarLinkComponent } from './Sidebar.types'

interface SidebarGroupProps {
  icon: SidebarGroupItem['icon']
  label: string
  items: SidebarGroupItem['items']
  collapsed: boolean
  activePath: string | null
  ariaCurrent: SidebarAriaCurrent
  linkComponent: SidebarLinkComponent
  onAfterNavigate: () => void
}

export function SidebarGroup({
  icon: Icon,
  label,
  items,
  collapsed,
  activePath,
  ariaCurrent,
  linkComponent: LinkComponent,
  onAfterNavigate,
}: SidebarGroupProps) {
  const hasActiveChild = items.some((child) => child.path === activePath)
  const [expanded, setExpanded] = useState(hasActiveChild)
  const [hadActiveChild, setHadActiveChild] = useState(hasActiveChild)
  const listId = useId()

  if (hasActiveChild !== hadActiveChild) {
    setHadActiveChild(hasActiveChild)
    if (hasActiveChild) {
      setExpanded(true)
    }
  }

  if (collapsed) {
    return (
      <SidebarFlyout
        icon={Icon}
        label={label}
        items={items}
        hasActiveChild={hasActiveChild}
        activePath={activePath}
        ariaCurrent={ariaCurrent}
        linkComponent={LinkComponent}
        onAfterNavigate={onAfterNavigate}
      />
    )
  }

  const groupIsCurrent = hasActiveChild && !expanded

  return (
    <li>
      <button
        type="button"
        className={cn(
          'cursor-pointer',
          rowClassName({ current: groupIsCurrent, emphasized: hasActiveChild }),
        )}
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        aria-controls={expanded ? listId : undefined}
        aria-current={groupIsCurrent ? 'true' : undefined}
      >
        <Icon size={18} className="shrink-0" />
        <span className="min-w-0 flex-1 break-words">{label}</span>
        <ChevronRight
          size={16}
          className={cn(
            'shrink-0 opacity-80 transition-transform motion-reduce:transition-none',
            expanded && 'rotate-90',
          )}
        />
      </button>

      {expanded && (
        <ul id={listId} className="mt-0.5 flex flex-col gap-0.5">
          {items.map((child) => {
            const childIsCurrent = child.path === activePath
            return (
              <li key={child.path}>
                <LinkComponent
                  to={child.path}
                  onClick={onAfterNavigate}
                  className={rowClassName({ current: childIsCurrent, nested: true })}
                  aria-current={childIsCurrent ? ariaCurrent : undefined}
                >
                  <span className="min-w-0 flex-1 break-words">{child.label}</span>
                </LinkComponent>
              </li>
            )
          })}
        </ul>
      )}
    </li>
  )
}
