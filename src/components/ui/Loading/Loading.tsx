import { SystemLogo } from '@/components/ui/SystemLogo'
import { cn } from '@/utils/cn'
import { Spinner, type SpinnerSize } from './Spinner'

type LoadingVariant = 'inline' | 'container' | 'fullscreen' | 'logo'

interface LoadingProps {
  variant?: LoadingVariant
  size?: SpinnerSize
  message?: string
  ariaLabel?: string
  className?: string
}

export function Loading({
  variant = 'container',
  size = 'md',
  message,
  ariaLabel = 'Cargando',
  className,
}: LoadingProps) {
  if (variant === 'inline') {
    return (
      <Spinner
        size="sm"
        role="status"
        aria-label={ariaLabel}
        className={cn('text-primary-600', className)}
      />
    )
  }

  if (variant === 'container') {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label={ariaLabel}
        className={cn('flex items-center justify-center p-8 text-primary-600', className)}
      >
        <Spinner size={size} aria-hidden="true" />
      </div>
    )
  }

  if (variant === 'fullscreen') {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label={ariaLabel}
        className={cn(
          'flex min-h-screen flex-col items-center justify-center bg-primary-50 text-primary-600',
          className,
        )}
      >
        <Spinner size="lg" aria-hidden="true" />
        {message && <p className="mt-4 text-sm tracking-wide text-primary-800">{message}</p>}
      </div>
    )
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
      className={cn(
        'flex min-h-screen flex-col items-center justify-center bg-primary-50 text-primary-600',
        className,
      )}
    >
      <div className="animate-logo-fade">
        <SystemLogo className="h-8 w-auto" colorMode="custom" variant="mini" />
      </div>
      {message && (
        <p className="mt-6 text-xs uppercase tracking-widest text-primary-700">{message}</p>
      )}
    </div>
  )
}
