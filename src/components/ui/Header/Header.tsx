import { Menu } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface HeaderProps {
  onToggleSidebar: () => void
  children?: ReactNode
  className?: string
}

export function Header({ onToggleSidebar, children, className }: HeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 w-full bg-white border-b border-mercury-200 shadow-sm h-16 flex items-center px-4 z-20',
        className,
      )}
    >
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label="Alternar barra lateral"
        className="text-mercury-700 hover:bg-mercury-100 rounded-md p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <Menu size={22} />
      </button>

      {children && <div className="flex-1 flex items-center justify-end gap-2">{children}</div>}
    </header>
  )
}
