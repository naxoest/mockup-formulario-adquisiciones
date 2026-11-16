import { useId } from 'react'
import { cn } from '@/utils/cn'
import type { ErrorStateProps } from './ErrorState.types'

export function ErrorState({
  title,
  description,
  code,
  icon,
  actions,
  className,
}: ErrorStateProps) {
  const titleId = useId()

  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        'flex flex-col items-center justify-center gap-4 px-4 py-16 text-center',
        className,
      )}
    >
      {icon && (
        <div
          aria-hidden="true"
          className="flex size-14 items-center justify-center rounded-full bg-mercury-100 text-mercury-600"
        >
          {icon}
        </div>
      )}
      {code && (
        <p className="text-sm font-semibold uppercase tracking-wide text-mercury-500">
          Error {code}
        </p>
      )}
      <h1 id={titleId} className="text-2xl font-bold text-mercury-900">
        {title}
      </h1>
      {description && <p className="max-w-md text-sm text-mercury-600">{description}</p>}
      {actions && (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">{actions}</div>
      )}
    </section>
  )
}
