import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { cn } from '@/utils/cn'
import { type PageHeaderProps } from './PageHeader.types'

export function PageHeader({
  title,
  description,
  icon,
  breadcrumbs,
  actions,
  className,
}: PageHeaderProps) {
  const hasBreadcrumbs = breadcrumbs && breadcrumbs.length > 0
  const hasRightSide = Boolean(actions) || hasBreadcrumbs

  return (
    <div className={cn('mb-6', className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4 sm:items-center">
          {icon && (
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-700"
              aria-hidden="true"
            >
              {icon}
            </div>
          )}
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-primary-900">{title}</h1>
            {description && <p className="text-sm text-mercury-600">{description}</p>}
          </div>
        </div>

        {hasRightSide && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            {actions && <div className="order-2 sm:order-1">{actions}</div>}
            {hasBreadcrumbs && (
              <div className={cn(actions && 'order-1 sm:order-2')}>
                <Breadcrumbs items={breadcrumbs} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
