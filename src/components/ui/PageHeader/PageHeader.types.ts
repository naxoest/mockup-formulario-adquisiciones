import { type ReactNode } from 'react'
import { type BreadcrumbItem } from '@/components/ui/Breadcrumbs'

export interface PageHeaderProps {
  title: string
  description?: string
  icon?: ReactNode
  breadcrumbs?: BreadcrumbItem[]
  actions?: ReactNode
  className?: string
}
