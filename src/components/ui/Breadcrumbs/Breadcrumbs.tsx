import { Link } from '@tanstack/react-router'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  homeHref?: string
  showHome?: boolean
  className?: string
}

export function Breadcrumbs({
  items,
  homeHref = '/',
  showHome = true,
  className,
}: BreadcrumbsProps) {
  if (!showHome && items.length === 0) return null

  return (
    <nav className={cn('flex', className)} aria-label="Breadcrumb">
      <ol className="flex items-center gap-1 text-sm text-mercury-500">
        {showHome && (
          <li className="flex items-center">
            <Link
              to={homeHref as never}
              className="flex items-center gap-1 hover:text-primary-700 transition-colors"
            >
              <Home size={16} aria-hidden="true" />
              <span>Inicio</span>
            </Link>
          </li>
        )}
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          const showSeparator = showHome || index > 0
          return (
            <li key={index} className="flex items-center gap-1">
              {showSeparator && (
                <ChevronRight size={14} className="text-mercury-400" aria-hidden="true" />
              )}
              {item.href && !isLast ? (
                <Link to={item.href as never} className="hover:text-primary-700 transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(isLast && 'text-primary-900 font-medium')}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
