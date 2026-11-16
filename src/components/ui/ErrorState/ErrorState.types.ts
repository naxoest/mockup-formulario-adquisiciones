import type { ReactNode } from 'react'

export interface ErrorStateProps {
  title: string
  description?: string
  code?: string
  icon?: ReactNode
  actions?: ReactNode
  className?: string
}
