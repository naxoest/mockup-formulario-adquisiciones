import { ChevronDown, ChevronRight } from 'lucide-react'
import type { Table } from '@tanstack/react-table'
import { cn } from '@/utils/cn'
import { TableActions } from './TableActions'
import type { ColumnDef, Density, RowAction } from './DataTable.types'

interface CardViewProps<T> {
  table: Table<T>
  columns: ColumnDef<T>[]
  onRowClick?: (row: T) => void
  actions?: RowAction<T>[]
  shouldShowActions?: (action: RowAction<T>, row: T) => boolean
  maxVisibleActions?: number
  rowClassName?: (row: T) => string | undefined
  density?: Density
  renderExpandedRow?: (row: T) => React.ReactNode
  getRowCanExpand?: (row: T) => boolean
}

export function CardView<T>({
  table,
  columns,
  onRowClick,
  actions = [],
  shouldShowActions,
  maxVisibleActions = 2,
  rowClassName,
  density = 'normal',
  renderExpandedRow,
  getRowCanExpand,
}: CardViewProps<T>) {
  const rows = table.getRowModel().rows
  const hasExpansion = !!renderExpandedRow

  if (rows.length === 0) return null

  return (
    <div className="grid gap-4 p-4">
      {rows.map((row) => {
        const custom = rowClassName?.(row.original)
        const canExpand = hasExpansion && (getRowCanExpand ? getRowCanExpand(row.original) : true)
        const isExpanded = row.getIsExpanded()

        return (
          <div
            key={row.id}
            className={cn(
              'bg-white rounded-xl border border-mercury-200 shadow-sm',
              onRowClick && 'cursor-pointer hover:shadow-md transition-shadow',
              custom,
            )}
            onClick={() => onRowClick?.(row.original)}
          >
            <div className="p-4">
              <dl className="space-y-2">
                {columns.map((column) => {
                  const cell = row.getVisibleCells().find((c) => c.column.id === column.field)
                  const value = cell ? cell.getValue() : null
                  const displayValue = column.renderCell
                    ? column.renderCell(row.original)
                    : value !== null && value !== undefined
                      ? String(value)
                      : '—'

                  return (
                    <div key={column.field} className="flex justify-between items-start gap-4">
                      <dt className="text-xs font-medium text-mercury-500">{column.header}</dt>
                      <dd className="text-sm text-mercury-900 text-right">{displayValue}</dd>
                    </div>
                  )
                })}
              </dl>

              {canExpand && (
                <div className="mt-3 pt-3 border-t border-mercury-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      row.toggleExpanded()
                    }}
                    aria-expanded={isExpanded}
                    aria-label={isExpanded ? 'Ocultar detalles' : 'Ver detalles'}
                    className={cn(
                      'w-full flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium',
                      'text-primary-700 hover:bg-primary-50 transition-colors',
                      'focus:outline-none focus:ring-2 focus:ring-primary-500',
                    )}
                  >
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <span>{isExpanded ? 'Ocultar detalles' : 'Ver detalles'}</span>
                  </button>
                </div>
              )}

              {hasExpansion && isExpanded && renderExpandedRow && (
                <div
                  className="mt-3 pt-3 border-t border-mercury-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  {renderExpandedRow(row.original)}
                </div>
              )}

              {actions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-mercury-100">
                  <TableActions
                    row={row.original}
                    actions={actions}
                    maxVisibleActions={maxVisibleActions}
                    shouldShowActions={shouldShowActions}
                    density={density}
                  />
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
