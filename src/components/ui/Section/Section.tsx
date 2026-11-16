import { useId, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

type HeadingLevel = 2 | 3 | 4

type SectionProps = Omit<ComponentPropsWithoutRef<'section'>, 'title'> & {
  title?: string
  description?: string
  headingLevel?: HeadingLevel
  actions?: ReactNode
  ariaLabel?: string
}

const headingClasses: Record<HeadingLevel, string> = {
  2: 'text-lg font-bold text-mercury-900',
  3: 'text-base font-bold text-mercury-900',
  4: 'text-sm font-bold text-mercury-900',
}

export function Section({
  title,
  description,
  headingLevel = 2,
  actions,
  ariaLabel,
  className,
  children,
  ...props
}: SectionProps) {
  const headingId = useId()
  const hasHeader = Boolean(title) || Boolean(actions)
  const useSectionElement = Boolean(title) || Boolean(ariaLabel)

  const HeadingTag = `h${headingLevel}` as 'h2' | 'h3' | 'h4'

  const content = (
    <>
      {hasHeader && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          {(title || description) && (
            <div className="flex flex-col gap-1">
              {title && (
                <HeadingTag id={headingId} className={headingClasses[headingLevel]}>
                  {title}
                </HeadingTag>
              )}
              {description && <p className="text-sm text-mercury-600">{description}</p>}
            </div>
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children && <div className={hasHeader ? 'mt-4' : ''}>{children}</div>}
    </>
  )

  if (useSectionElement) {
    return (
      <section
        aria-labelledby={title ? headingId : undefined}
        aria-label={!title && ariaLabel ? ariaLabel : undefined}
        className={cn(className)}
        {...props}
      >
        {content}
      </section>
    )
  }

  return (
    <div className={cn(className)} {...props}>
      {content}
    </div>
  )
}
