import { useId, useState, type FocusEvent } from 'react'
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
} from '@floating-ui/react'
import { Tooltip } from '@/components/ui/Tooltip'
import { cn } from '@/utils/cn'
import { rowClassName } from './Sidebar.utils'
import type { SidebarAriaCurrent, SidebarGroupItem, SidebarLinkComponent } from './Sidebar.types'

interface SidebarFlyoutProps {
  icon: SidebarGroupItem['icon']
  label: string
  items: SidebarGroupItem['items']
  hasActiveChild: boolean
  activePath: string | null
  ariaCurrent: SidebarAriaCurrent
  linkComponent: SidebarLinkComponent
  onAfterNavigate: () => void
}

export function SidebarFlyout({
  icon: Icon,
  label,
  items,
  hasActiveChild,
  activePath,
  ariaCurrent,
  linkComponent: LinkComponent,
  onAfterNavigate,
}: SidebarFlyoutProps) {
  const [open, setOpen] = useState(false)
  const [reference, setReference] = useState<HTMLElement | null>(null)
  const [floating, setFloating] = useState<HTMLElement | null>(null)
  const panelId = useId()

  const { floatingStyles, context } = useFloating({
    open,
    onOpenChange: (nextOpen, _event, reason) => {
      setOpen(nextOpen)
      if (reason === 'escape-key') {
        reference?.focus()
      }
    },
    strategy: 'fixed',
    placement: 'right-start',
    elements: { reference, floating },
    whileElementsMounted: autoUpdate,
    middleware: [offset(12), flip({ padding: 8 }), shift({ padding: 8 })],
  })

  const click = useClick(context)
  const dismiss = useDismiss(context)
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss])

  const handleBlur = (event: FocusEvent<HTMLLIElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setOpen(false)
    }
  }

  const handleNavigate = () => {
    setOpen(false)
    onAfterNavigate()
  }

  return (
    <li onBlur={handleBlur}>
      <Tooltip content={label} role="label" placement="right" disabled={open}>
        <button
          ref={setReference}
          type="button"
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          aria-current={hasActiveChild ? 'true' : undefined}
          {...getReferenceProps()}
          className={cn(
            'cursor-pointer',
            rowClassName({ current: hasActiveChild, collapsed: true }),
            open && !hasActiveChild && 'bg-sidebar-foreground/12',
          )}
        >
          <Icon size={18} className="shrink-0" />
          <span className="sr-only">{label}</span>
        </button>
      </Tooltip>

      {open && (
        <div
          id={panelId}
          ref={setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
          className="z-50 w-60 rounded-lg border border-sidebar-foreground/15 bg-sidebar p-1.5 text-sidebar-foreground shadow-lg"
        >
          <p className="px-2.75 py-1.5 text-xs font-semibold text-sidebar-foreground/80">{label}</p>
          <ul className="flex flex-col gap-0.5">
            {items.map((child) => {
              const childIsCurrent = child.path === activePath
              return (
                <li key={child.path}>
                  <LinkComponent
                    to={child.path}
                    onClick={handleNavigate}
                    className={rowClassName({ current: childIsCurrent })}
                    aria-current={childIsCurrent ? ariaCurrent : undefined}
                  >
                    <span className="min-w-0 flex-1 break-words">{child.label}</span>
                  </LinkComponent>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </li>
  )
}
