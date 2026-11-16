import type { ReactNode } from 'react'

export interface DisclosureListItem {
  id: string
  hasError?: boolean
}

export interface DisclosureListItemState {
  index: number
  isOpen: boolean
  hasError: boolean
}

export interface DisclosureListProps {
  items: DisclosureListItem[]
  renderSummary: (state: DisclosureListItemState) => ReactNode
  renderDetail: (state: DisclosureListItemState) => ReactNode
  renderItemAction?: (state: DisclosureListItemState) => ReactNode
  openIds?: ReadonlySet<string>
  onToggle?: (id: string) => void
  description?: ReactNode
  emptyState?: ReactNode
  message?: string
  className?: string
}
