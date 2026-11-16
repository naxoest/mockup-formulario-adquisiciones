import { cn } from '@/utils/cn'
import type { BadgeProps, BadgeSize, BadgeVariant } from './Badge.types'

const variantClasses: Record<BadgeVariant, string> = {
  neutral: 'bg-mercury-100 text-mercury-800',
  info: 'bg-primary-100 text-primary-800',
  success: 'bg-jade-100 text-jade-800',
  warning: 'bg-saffron-100 text-saffron-800',
  error: 'bg-scarlet-100 text-scarlet-800',
}

const dotClasses: Record<BadgeVariant, string> = {
  neutral: 'bg-mercury-500',
  info: 'bg-primary-500',
  success: 'bg-jade-500',
  warning: 'bg-saffron-500',
  error: 'bg-scarlet-500',
}

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'gap-1 px-2 py-0.5 text-xs',
  md: 'gap-1.5 px-2.5 py-0.5 text-sm',
  lg: 'gap-1.5 px-3 py-1 text-sm',
}

const iconSizeClasses: Record<BadgeSize, string> = {
  sm: '[&_svg]:size-3',
  md: '[&_svg]:size-3.5',
  lg: '[&_svg]:size-4',
}

const dotSizeClasses: Record<BadgeSize, string> = {
  sm: 'size-1.5',
  md: 'size-2',
  lg: 'size-2',
}

export function Badge({
  variant = 'neutral',
  size = 'md',
  icon,
  dot = false,
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium whitespace-nowrap',
        variantClasses[variant],
        sizeClasses[size],
        icon ? iconSizeClasses[size] : undefined,
        className,
      )}
      {...rest}
    >
      {dot ? (
        <span
          aria-hidden="true"
          className={cn('shrink-0 rounded-full', dotClasses[variant], dotSizeClasses[size])}
        />
      ) : null}
      {icon ? (
        <span aria-hidden="true" className="inline-flex shrink-0">
          {icon}
        </span>
      ) : null}
      {children}
    </span>
  )
}
