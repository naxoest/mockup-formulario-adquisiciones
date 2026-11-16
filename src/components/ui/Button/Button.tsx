import type { ButtonHTMLAttributes, Ref } from 'react'
import { Spinner, type SpinnerSize } from '@/components/ui/Loading'
import { cn } from '@/utils/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  ref?: Ref<HTMLButtonElement>
}

const baseClasses =
  'relative inline-flex items-center justify-center rounded-lg font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed'

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-600 text-white border border-transparent hover:bg-primary-700 hover:shadow-md focus:ring-primary-500 active:translate-y-0.5',
  secondary:
    'bg-white border-2 border-mercury-200 text-mercury-700 hover:border-primary-500 hover:bg-primary-50 hover:text-primary-600 focus:ring-primary-200',
  ghost: 'text-espresso-600 hover:bg-espresso-100 hover:text-espresso-900 focus:ring-espresso-200',
  danger:
    'bg-scarlet-50 text-scarlet-600 border border-scarlet-200 hover:bg-scarlet-100 focus:ring-scarlet-200',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs uppercase tracking-wide',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-8 py-3.5 text-base',
}

const spinnerSizeByButtonSize: Record<ButtonSize, SpinnerSize> = {
  sm: 'sm',
  md: 'md',
  lg: 'md',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  className,
  children,
  ref,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      ref={ref}
      type={type}
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      disabled={isDisabled}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <Spinner size={spinnerSizeByButtonSize[size]} />
        </span>
      )}
      <span className={cn('inline-flex items-center gap-2', loading && 'invisible')}>
        {children}
      </span>
    </button>
  )
}
