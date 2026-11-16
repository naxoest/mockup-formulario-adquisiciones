import { type ComponentPropsWithoutRef } from 'react'
import { cn } from '@/utils/cn'

type MaxWidth = 'none' | 'lg' | 'xl' | '2xl' | '7xl'
type Spacing = 'none' | 'tight' | 'normal' | 'loose'

type PageLayoutProps = ComponentPropsWithoutRef<'div'> & {
  maxWidth?: MaxWidth
  spacing?: Spacing
}

const maxWidthClasses: Record<MaxWidth, string> = {
  none: '',
  lg: 'max-w-lg mx-auto',
  xl: 'max-w-xl mx-auto',
  '2xl': 'max-w-2xl mx-auto',
  '7xl': 'max-w-7xl mx-auto',
}

const spacingClasses: Record<Spacing, string> = {
  none: '',
  tight: 'space-y-4',
  normal: 'space-y-8',
  loose: 'space-y-12',
}

export function PageLayout({
  maxWidth = '7xl',
  spacing = 'normal',
  className,
  children,
  ...props
}: PageLayoutProps) {
  return (
    <div
      className={cn(
        'px-4 sm:px-6 lg:px-8 py-6 overflow-x-hidden',
        maxWidthClasses[maxWidth],
        spacingClasses[spacing],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
