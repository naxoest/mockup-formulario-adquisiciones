import type { HTMLAttributes, ReactNode } from 'react'

export type BadgeVariant = 'neutral' | 'info' | 'success' | 'warning' | 'error'

export type BadgeSize = 'sm' | 'md' | 'lg'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: BadgeSize
  icon?: ReactNode
  dot?: boolean
  children: ReactNode
}
