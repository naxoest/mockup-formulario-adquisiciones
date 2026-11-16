import { type ComponentPropsWithoutRef, type Ref } from 'react'
import { cn } from '@/utils/cn'

type CardProps = ComponentPropsWithoutRef<'div'> & {
  as?: 'div' | 'article' | 'section'
  hoverable?: boolean
}

export function Card({ as = 'div', hoverable = false, className, children, ...props }: CardProps) {
  const Component = as
  return (
    <Component
      className={cn(
        'bg-white rounded-lg border border-mercury-200',
        hoverable && 'transition-colors duration-200 hover:border-mercury-300 cursor-pointer',
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

type CardHeaderProps = ComponentPropsWithoutRef<'div'> & {
  ref?: Ref<HTMLDivElement>
}

const CardHeader = ({ className, children, ref, ...props }: CardHeaderProps) => (
  <div
    ref={ref}
    className={cn('flex items-center justify-between gap-4 px-6 py-4', className)}
    {...props}
  >
    {children}
  </div>
)

type CardTitleProps = ComponentPropsWithoutRef<'h3'> & {
  ref?: Ref<HTMLHeadingElement>
}

const CardTitle = ({ className, children, ref, ...props }: CardTitleProps) => (
  <h3 ref={ref} className={cn('text-sm font-medium text-mercury-900', className)} {...props}>
    {children}
  </h3>
)

type CardActionsProps = ComponentPropsWithoutRef<'div'> & {
  ref?: Ref<HTMLDivElement>
}

const CardActions = ({ className, children, ref, ...props }: CardActionsProps) => (
  <div ref={ref} className={cn('flex items-center gap-2 shrink-0', className)} {...props}>
    {children}
  </div>
)

type CardBodyProps = ComponentPropsWithoutRef<'div'> & {
  noPadding?: boolean
  overflow?: 'visible' | 'hidden' | 'x-auto'
  ref?: Ref<HTMLDivElement>
}

const CardBody = ({
  noPadding = false,
  overflow = 'visible',
  className,
  children,
  ref,
  ...props
}: CardBodyProps) => (
  <div
    ref={ref}
    className={cn(
      !noPadding && 'p-6',
      overflow === 'hidden' && 'overflow-hidden',
      overflow === 'x-auto' && 'overflow-x-auto',
      className,
    )}
    {...props}
  >
    {children}
  </div>
)

type CardFooterProps = ComponentPropsWithoutRef<'div'> & {
  ref?: Ref<HTMLDivElement>
}

const CardFooter = ({ className, children, ref, ...props }: CardFooterProps) => (
  <div
    ref={ref}
    className={cn('flex items-center justify-between gap-4 px-6 py-4', className)}
    {...props}
  >
    {children}
  </div>
)

Card.Header = CardHeader
Card.Title = CardTitle
Card.Actions = CardActions
Card.Body = CardBody
Card.Footer = CardFooter
