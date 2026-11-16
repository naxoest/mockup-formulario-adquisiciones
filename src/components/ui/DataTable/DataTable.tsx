import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnFiltersState,
  type ExpandedState,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
} from '@tanstack/react-table'
import { ChevronUp, ChevronDown, ChevronRight } from 'lucide-react'
import { Loading } from '@/components/ui/Loading'
import { cn } from '@/utils/cn'
import { CardView } from './CardView'
import { TableActions } from './TableActions'
import { TableHeader } from './TableHeader'
import { TablePagination } from './TablePagination'
import { useColumnAdapter, buildGlobalFilterFn } from './useColumnAdapter'
import { useMediaQuery } from './useMediaQuery'
import { exportToCSV, exportToExcel } from './export'
import type {
  ColumnDef,
  Density,
  ExportFormat,
  FetchDataParams,
  MobileView,
  PersistedTableState,
  RowAction,
} from './DataTable.types'

interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  loading?: boolean
  renderLoading?: () => React.ReactNode

  title?: string
  description?: string
  ariaLabel?: string

  pagination?: boolean
  initialPageSize?: number
  pageSizeOptions?: number[]

  searchable?: boolean
  searchDebounceMs?: number

  onRowClick?: (row: T) => void
  onAdd?: () => void

  actions?: RowAction<T>[]
  shouldShowActions?: (action: RowAction<T>, row: T) => boolean
  maxVisibleActions?: number

  exportable?: boolean
  exportFormats?: ExportFormat[]
  exportFilename?: string
  onExport?: (format: ExportFormat, data: T[], columns: ColumnDef<T>[]) => void

  density?: Density
  allowDensityChange?: boolean
  mobileView?: MobileView
  stickyHeader?: boolean
  maxHeight?: string

  rowClassName?: (row: T) => string | undefined

  emptyMessage?: string

  persistKey?: string

  apiMode?: boolean
  fetchData?: (params: FetchDataParams) => void
  totalRows?: number
  page?: number
  onPageChange?: (page: number) => void

  renderExpandedRow?: (row: T) => React.ReactNode
  getRowCanExpand?: (row: T) => boolean
}

type DensityStyle = { rowHeight: number; padding: string; fontSize: string }

const ariaSortValues = {
  asc: 'ascending',
  desc: 'descending',
  none: undefined,
} as const

const densityConfig: Record<Density, DensityStyle> = {
  compact: { rowHeight: 36, padding: 'px-4 py-2', fontSize: 'text-sm' },
  normal: { rowHeight: 48, padding: 'px-4 py-3', fontSize: 'text-sm' },
  comfortable: {
    rowHeight: 64,
    padding: 'px-4 py-5',
    fontSize: 'text-base',
  },
}

function readPersistedState(key: string): PersistedTableState {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(`datatable_${key}`)
    return raw ? (JSON.parse(raw) as PersistedTableState) : {}
  } catch {
    return {}
  }
}

function writePersistedState(key: string, state: PersistedTableState): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(`datatable_${key}`, JSON.stringify(state))
  } catch {
    // noop
  }
}

export function DataTable<T>({
  columns,
  data,
  loading = false,
  renderLoading,

  title,
  description,
  ariaLabel,

  pagination = true,
  initialPageSize = 10,
  pageSizeOptions = [5, 10, 25, 50, 100],

  searchable = true,
  searchDebounceMs = 300,

  onRowClick,
  onAdd,

  actions = [],
  shouldShowActions,
  maxVisibleActions = 2,

  exportable = false,
  exportFormats = ['csv', 'excel'],
  exportFilename = 'tabla',
  onExport,

  density = 'normal',
  allowDensityChange = true,
  mobileView = 'card',
  stickyHeader = true,
  maxHeight,

  rowClassName,

  emptyMessage = 'No hay datos disponibles',

  persistKey,

  apiMode = false,
  fetchData,
  totalRows = 0,
  page,
  onPageChange,

  renderExpandedRow,
  getRowCanExpand,
}: DataTableProps<T>) {
  const persisted = useMemo<PersistedTableState>(
    () => (persistKey ? readPersistedState(persistKey) : {}),
    [persistKey],
  )

  const [globalFilter, setGlobalFilter] = useState('')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>(persisted.sorting ?? [])
  const [currentDensity, setCurrentDensity] = useState<Density>(persisted.density ?? density)
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: persisted.pageSize ?? initialPageSize,
  })
  const [currentView, setCurrentView] = useState<MobileView>('table')
  const [expanded, setExpanded] = useState<ExpandedState>({})

  const isSmall = useMediaQuery('(max-width: 639px)')
  const isMedium = useMediaQuery('(min-width: 640px) and (max-width: 1023px)')

  const styles = densityConfig[currentDensity]
  const tanstackColumns = useColumnAdapter(columns)

  const globalFilterFn = useMemo(() => buildGlobalFilterFn(columns), [columns])

  const hasExpansion = !!renderExpandedRow

  const pageIndex = apiMode ? (page ?? 1) - 1 : paginationState.pageIndex
  const pageSize = paginationState.pageSize
  const pageCount = Math.ceil(totalRows / pageSize)

  const handlePaginationChange: OnChangeFn<PaginationState> = (updater) => {
    if (!apiMode) {
      setPaginationState(updater)
      return
    }

    const current = { pageIndex, pageSize }
    const next = typeof updater === 'function' ? updater(current) : updater

    if (next.pageSize !== pageSize) {
      setPaginationState((prev) => ({ ...prev, pageSize: next.pageSize }))
    }

    if (next.pageIndex !== pageIndex) {
      onPageChange?.(next.pageIndex + 1)
    }
  }

  const resolveRowCanExpand = useCallback(
    (original: T): boolean => {
      if (!hasExpansion) return false
      if (getRowCanExpand) return getRowCanExpand(original)
      return true
    },
    [hasExpansion, getRowCanExpand],
  )

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table returns non-memoizable functions; React Compiler will skip optimization for this component
  const table = useReactTable({
    data,
    columns: tanstackColumns,
    state: {
      globalFilter,
      columnFilters,
      sorting,
      pagination: { pageIndex, pageSize },
      expanded,
    },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: handlePaginationChange,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: pagination ? getPaginationRowModel() : undefined,
    getExpandedRowModel: hasExpansion ? getExpandedRowModel() : undefined,
    getRowCanExpand: hasExpansion ? (row) => resolveRowCanExpand(row.original) : undefined,
    globalFilterFn,
    manualPagination: apiMode,
    manualSorting: apiMode,
    manualFiltering: apiMode,
    pageCount: apiMode ? pageCount : undefined,
  })

  useEffect(() => {
    if (!persistKey) return
    writePersistedState(persistKey, {
      pageSize,
      density: currentDensity,
      sorting,
    })
  }, [persistKey, pageSize, currentDensity, sorting])

  useEffect(() => {
    if (isSmall && mobileView === 'card') {
      setCurrentView('card')
    } else {
      setCurrentView('table')
    }
  }, [isSmall, mobileView])

  const handleSearchChange = (value: string) => {
    setGlobalFilter(value)
    table.setPageIndex(0)
  }

  const fetchDataRef = useRef(fetchData)
  useEffect(() => {
    fetchDataRef.current = fetchData
  }, [fetchData])

  useEffect(() => {
    if (!apiMode || !fetchDataRef.current) return
    fetchDataRef.current({
      page: pageIndex + 1,
      pageSize,
      sortField: sorting[0]?.id ?? null,
      sortDirection: sorting[0] ? (sorting[0].desc ? 'desc' : 'asc') : null,
      searchTerm: globalFilter,
    })
  }, [apiMode, pageIndex, pageSize, sorting, globalFilter])

  useEffect(() => {
    if (apiMode && !loading && totalRows > 0 && pageIndex >= pageCount) {
      onPageChange?.(pageCount)
    }
  }, [apiMode, loading, totalRows, pageIndex, pageCount, onPageChange])

  const handleExport = useCallback(
    (format: ExportFormat) => {
      const filteredData = table.getFilteredRowModel().rows.map((row) => row.original)

      if (onExport) {
        onExport(format, filteredData, columns)
        return
      }

      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `${exportFilename}_${timestamp}`

      if (format === 'csv') {
        exportToCSV(filteredData, columns, `${filename}.csv`)
      } else if (format === 'excel') {
        exportToExcel(filteredData, columns, `${filename}.xls`)
      }
    },
    [table, columns, exportFilename, onExport],
  )

  const hasActions = actions.length > 0
  const canExport = exportable && (!apiMode || onExport !== undefined)
  const hasResults = apiMode ? totalRows > 0 : table.getRowModel().rows.length > 0

  const totalColumns = useMemo(() => {
    let count = table.getVisibleLeafColumns().length
    if (hasActions) count += 1
    if (hasExpansion) count += 1
    return count
  }, [table, hasActions, hasExpansion])

  const getRowClassName = (original: T): string => {
    const parts: string[] = ['hover:bg-mercury-50 transition-colors']
    if (onRowClick) parts.push('cursor-pointer')
    const custom = rowClassName?.(original)
    if (custom) parts.push(custom)
    return parts.join(' ')
  }

  const renderContent = () => {
    if (loading) {
      if (renderLoading) return renderLoading()
      return <Loading variant="container" />
    }

    if (currentView === 'card') {
      if (table.getRowModel().rows.length === 0) {
        return <div className="p-8 text-center text-mercury-500">{emptyMessage}</div>
      }
      return (
        <CardView
          table={table}
          columns={columns}
          onRowClick={onRowClick}
          actions={actions}
          shouldShowActions={shouldShowActions}
          maxVisibleActions={maxVisibleActions}
          rowClassName={rowClassName}
          density={currentDensity}
          renderExpandedRow={renderExpandedRow}
          getRowCanExpand={getRowCanExpand}
        />
      )
    }

    const tableContainerStyle = maxHeight ? { maxHeight, overflowY: 'auto' as const } : undefined

    return (
      <div className="overflow-x-auto" style={tableContainerStyle}>
        <table aria-label={ariaLabel ?? title} className="min-w-full divide-y divide-mercury-200">
          <thead
            className={cn('bg-mercury-50/70', stickyHeader && maxHeight && 'sticky top-0 z-10')}
          >
            <tr>
              {hasExpansion && (
                <th
                  scope="col"
                  className={cn(
                    styles.padding,
                    'w-10',
                    stickyHeader && maxHeight && 'bg-mercury-50/70',
                  )}
                >
                  <span className="sr-only">Detalle</span>
                </th>
              )}

              {table.getHeaderGroups().map((headerGroup) =>
                headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as { width?: string } | undefined
                  const canSort = header.column.getCanSort()
                  const sorted = header.column.getIsSorted()
                  const headerContent = flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )

                  return (
                    <th
                      key={header.id}
                      scope="col"
                      aria-sort={ariaSortValues[sorted || 'none']}
                      className={cn(
                        !canSort && styles.padding,
                        'text-left text-sm font-semibold text-mercury-700',
                        canSort && 'select-none hover:bg-mercury-100',
                        meta?.width,
                        stickyHeader && maxHeight && 'bg-mercury-50/70',
                      )}
                    >
                      {canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className={cn(
                            styles.padding,
                            'flex w-full cursor-pointer items-center space-x-1 text-left',
                            'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500',
                          )}
                        >
                          <span>{headerContent}</span>
                          {sorted === 'asc' && (
                            <ChevronUp size={16} className="text-primary-600" aria-hidden="true" />
                          )}
                          {sorted === 'desc' && (
                            <ChevronDown
                              size={16}
                              className="text-primary-600"
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <span>{headerContent}</span>
                        </div>
                      )}
                    </th>
                  )
                }),
              )}

              {hasActions && (
                <th
                  scope="col"
                  className={cn(
                    styles.padding,
                    'text-right text-sm font-semibold text-mercury-700',
                    stickyHeader && maxHeight && 'bg-mercury-50/70',
                  )}
                >
                  Acciones
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-mercury-100">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={totalColumns}
                  className={cn(styles.padding, styles.fontSize, 'text-center text-mercury-500')}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => {
                const canExpand = hasExpansion && row.getCanExpand()
                const isExpanded = row.getIsExpanded()

                return (
                  <Fragment key={row.id}>
                    <tr
                      className={getRowClassName(row.original)}
                      onClick={() => onRowClick?.(row.original)}
                      style={{ height: `${styles.rowHeight}px` }}
                    >
                      {hasExpansion && (
                        <td
                          className={cn(styles.padding, 'w-10 text-mercury-500')}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {canExpand && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                row.toggleExpanded()
                              }}
                              aria-expanded={isExpanded}
                              aria-label={isExpanded ? 'Colapsar fila' : 'Expandir fila'}
                              className={cn(
                                'rounded-md p-1 transition-colors hover:bg-mercury-100',
                                'focus:outline-none focus:ring-2 focus:ring-primary-500',
                              )}
                            >
                              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                          )}
                        </td>
                      )}

                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className={cn(styles.padding, styles.fontSize, 'text-mercury-700')}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}

                      {hasActions && (
                        <td
                          className={cn(
                            styles.padding,
                            'whitespace-nowrap text-right',
                            styles.fontSize,
                            'text-mercury-500',
                          )}
                        >
                          <TableActions
                            row={row.original}
                            actions={actions}
                            maxVisibleActions={maxVisibleActions}
                            shouldShowActions={shouldShowActions}
                            density={currentDensity}
                          />
                        </td>
                      )}
                    </tr>

                    {hasExpansion && isExpanded && renderExpandedRow && (
                      <tr className="bg-mercury-50/40">
                        <td
                          colSpan={totalColumns}
                          className={cn(styles.padding, 'border-t border-mercury-100')}
                        >
                          {renderExpandedRow(row.original)}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="rounded-lg overflow-hidden relative">
      <TableHeader
        title={title}
        description={description}
        searchable={searchable}
        searchValue={globalFilter}
        onSearchChange={handleSearchChange}
        searchDebounceMs={searchDebounceMs}
        pagination={pagination}
        pageSize={pageSize}
        pageSizeOptions={pageSizeOptions}
        onPageSizeChange={(size) => table.setPageSize(size)}
        exportable={canExport}
        exportFormats={exportFormats}
        onExport={handleExport}
        onAdd={onAdd}
        allowDensityChange={allowDensityChange}
        density={currentDensity}
        onDensityChange={setCurrentDensity}
        isSmall={isSmall}
        isMedium={isMedium}
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      <div aria-busy={loading}>{renderContent()}</div>

      {pagination && !loading && hasResults && (
        <TablePagination table={table} totalRows={apiMode ? totalRows : undefined} />
      )}
    </div>
  )
}
