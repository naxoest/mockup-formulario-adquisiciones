import type { ReactNode } from 'react'

export type Density = 'compact' | 'normal' | 'comfortable'
export type MobileView = 'card' | 'table'
export type ExportFormat = 'csv' | 'excel'

export type ColumnType = 'text' | 'number' | 'boolean' | 'date' | 'datetime' | 'status' | 'currency'

export interface ColumnDef<T> {
  field: keyof T & string
  header: string
  sortable?: boolean
  width?: string
  renderCell?: (row: T) => ReactNode
  getSearchText?: (row: T) => string
  type?: ColumnType
  currency?: string
}

export interface RowAction<T> {
  key: string
  label: string
  icon: ReactNode
  onClick: (row: T) => void
  disabled?: (row: T) => boolean
  className?: string
  hoverClassName?: string
}

export interface FetchDataParams {
  page: number
  pageSize: number
  sortField: string | null
  sortDirection: 'asc' | 'desc' | null
  searchTerm: string
}

export interface PersistedTableState {
  pageSize?: number
  density?: Density
  sorting?: Array<{ id: string; desc: boolean }>
}
