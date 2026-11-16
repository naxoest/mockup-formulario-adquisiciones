import type { ReactNode } from 'react'
import type { FieldArray, FieldArrayPath, FieldValues } from 'react-hook-form'

export interface FieldArrayItemState {
  index: number
  isOpen: boolean
  hasError: boolean
}

export interface FieldArrayProps<TValues extends FieldValues = FieldValues> {
  name: FieldArrayPath<TValues>
  defaultItem: () => FieldArray<TValues, FieldArrayPath<TValues>>
  renderSummary: (state: FieldArrayItemState) => ReactNode
  renderDetail: (state: FieldArrayItemState) => ReactNode
  description?: ReactNode
  max?: number
  addLabel?: string
  emptyState?: ReactNode
  itemLabel?: (index: number) => string
  canRemove?: (index: number) => boolean
  className?: string
}
