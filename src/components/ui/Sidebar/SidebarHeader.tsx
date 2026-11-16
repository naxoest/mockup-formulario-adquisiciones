import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { SidebarLinkComponent } from './Sidebar.types'

interface SidebarHeaderProps {
  collapsed: boolean
  header?: ReactNode
  linkComponent: SidebarLinkComponent
  onAfterNavigate: () => void
  onClose?: (() => void) | undefined
}

export function SidebarHeader({
  collapsed,
  header,
  linkComponent: LinkComponent,
  onAfterNavigate,
  onClose,
}: SidebarHeaderProps) {
  const content = header ?? (
    <span className="font-bold tracking-wide">{collapsed ? 'S' : 'Sistema'}</span>
  )

  return (
    <div
      className={cn(
        'flex items-center h-16 px-4 border-b border-sidebar-foreground/15 flex-shrink-0 overflow-hidden',
        collapsed ? 'justify-center' : 'justify-between',
      )}
    >
      <LinkComponent
        to="/"
        onClick={onAfterNavigate}
        className="flex items-center min-w-0 max-w-full overflow-hidden rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
        aria-label="Ir al inicio"
      >
        {content}
      </LinkComponent>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar navegación"
          className="-mr-2 flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-sidebar-foreground/12 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-current motion-reduce:transition-none"
        >
          <X size={20} />
        </button>
      )}
    </div>
  )
}
