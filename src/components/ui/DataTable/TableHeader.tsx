import { useEffect, useId, useRef, useState } from 'react'
import {
  Search,
  Download,
  PlusCircle,
  Minimize2,
  AlignJustify,
  Maximize2,
  Grid3x3,
  List,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { TableMenu, type TableMenuItem } from './TableMenu'
import type { Density, ExportFormat, MobileView } from './DataTable.types'

interface TableHeaderProps {
  title?: string
  description?: string

  searchable?: boolean
  searchValue: string
  onSearchChange: (value: string) => void
  searchDebounceMs?: number

  pagination?: boolean
  pageSize: number
  pageSizeOptions: number[]
  onPageSizeChange: (size: number) => void

  exportable?: boolean
  exportFormats?: ExportFormat[]
  onExport?: (format: ExportFormat) => void

  onAdd?: () => void

  allowDensityChange?: boolean
  density: Density
  onDensityChange: (density: Density) => void

  isSmall: boolean
  isMedium: boolean
  currentView: MobileView
  onViewChange: (view: MobileView) => void
}

const exportOptions: { format: ExportFormat; label: string }[] = [
  { format: 'csv', label: 'CSV' },
  { format: 'excel', label: 'Excel' },
]

export function TableHeader({
  title,
  description,
  searchable,
  searchValue,
  onSearchChange,
  searchDebounceMs = 300,
  pagination,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  exportable,
  exportFormats = ['csv', 'excel'],
  onExport,
  onAdd,
  allowDensityChange,
  density,
  onDensityChange,
  isSmall,
  isMedium,
  currentView,
  onViewChange,
}: TableHeaderProps) {
  const [localSearch, setLocalSearch] = useState(searchValue || '')
  const [lastExternalSearch, setLastExternalSearch] = useState(searchValue || '')

  if (searchValue !== lastExternalSearch) {
    setLastExternalSearch(searchValue)
    setLocalSearch(searchValue || '')
  }

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onSearchChangeRef = useRef(onSearchChange)

  useEffect(() => {
    onSearchChangeRef.current = onSearchChange
  }, [onSearchChange])

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  const handleSearchInput = (value: string) => {
    setLocalSearch(value)
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      onSearchChangeRef.current(value)
    }, searchDebounceMs)
  }

  const showViewToggle = isSmall || isMedium
  const showDensityChange = allowDensityChange && !isSmall && !isMedium

  const pageSizeSelectId = useId()

  const exportItems: TableMenuItem[] = exportOptions
    .filter(({ format }) => exportFormats.includes(format))
    .map(({ format, label }) => ({
      key: format,
      content: label,
      onSelect: () => onExport?.(format),
    }))

  return (
    <div className="px-4 py-4 sm:px-6">
      <div
        className={cn(
          'flex gap-4 items-start justify-between',
          isSmall ? 'flex-col' : 'flex-col lg:flex-row lg:items-center',
        )}
      >
        {(title || description) && (
          <div className="flex flex-col gap-1">
            {title && <h2 className="text-sm font-medium text-mercury-900">{title}</h2>}
            {description && <p className="text-xs text-mercury-500">{description}</p>}
          </div>
        )}

        <div className={cn('flex gap-2 items-center flex-wrap', isSmall ? 'w-full' : '')}>
          {searchable && (
            <div className={cn('relative', isSmall ? 'w-full' : '')}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-mercury-400" />
              </div>
              <input
                type="search"
                aria-label="Buscar en la tabla"
                placeholder="Buscar..."
                value={localSearch}
                onChange={(e) => handleSearchInput(e.target.value)}
                className={cn(
                  'h-9 pl-10 pr-3 py-1 border border-mercury-300 rounded-lg text-sm text-mercury-700',
                  'placeholder-mercury-400 hover:border-mercury-400',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
                  'block transition-colors',
                  isSmall ? 'w-full' : 'w-64',
                )}
              />
            </div>
          )}

          {showViewToggle && (
            <button
              type="button"
              onClick={() => onViewChange(currentView === 'table' ? 'card' : 'table')}
              aria-label={
                currentView === 'table' ? 'Cambiar a vista de tarjetas' : 'Cambiar a vista de tabla'
              }
              title={currentView === 'table' ? 'Vista de tarjetas' : 'Vista de tabla'}
              className="inline-flex items-center px-3 py-2 border border-mercury-300 text-sm leading-4 font-medium rounded-lg text-mercury-700 bg-white hover:bg-mercury-50 transition-colors"
            >
              {currentView === 'table' ? <Grid3x3 size={16} /> : <List size={16} />}
            </button>
          )}

          {showDensityChange && (
            <div
              className="flex items-center border border-mercury-300 rounded-lg overflow-hidden"
              role="group"
              aria-label="Densidad"
            >
              <button
                type="button"
                onClick={() => onDensityChange('compact')}
                aria-pressed={density === 'compact'}
                aria-label="Compacto"
                title="Compacto"
                className={cn(
                  'px-2.5 py-1.5 transition-colors',
                  density === 'compact'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-mercury-600 hover:bg-mercury-50',
                )}
              >
                <Minimize2 size={16} />
              </button>
              <button
                type="button"
                onClick={() => onDensityChange('normal')}
                aria-pressed={density === 'normal'}
                aria-label="Normal"
                title="Normal"
                className={cn(
                  'px-2.5 py-1.5 border-x border-mercury-300 transition-colors',
                  density === 'normal'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-mercury-600 hover:bg-mercury-50',
                )}
              >
                <AlignJustify size={16} />
              </button>
              <button
                type="button"
                onClick={() => onDensityChange('comfortable')}
                aria-pressed={density === 'comfortable'}
                aria-label="Cómodo"
                title="Cómodo"
                className={cn(
                  'px-2.5 py-1.5 transition-colors',
                  density === 'comfortable'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-mercury-600 hover:bg-mercury-50',
                )}
              >
                <Maximize2 size={16} />
              </button>
            </div>
          )}

          {pagination && !isSmall && (
            <div className="flex items-center gap-2">
              <label htmlFor={pageSizeSelectId} className="text-sm text-mercury-500 font-medium">
                Mostrar:
              </label>
              <select
                id={pageSizeSelectId}
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="h-9 px-3 py-1 border border-mercury-300 rounded-lg text-sm text-mercury-700 bg-white hover:border-mercury-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size} filas
                  </option>
                ))}
              </select>
            </div>
          )}

          {exportable && (
            <TableMenu
              label="Exportar"
              triggerClassName="inline-flex items-center px-3 py-2 border border-mercury-300 text-sm leading-4 font-medium rounded-lg text-mercury-700 bg-white hover:bg-mercury-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              menuClassName="w-32"
              items={exportItems}
            >
              <Download size={16} className={isSmall ? '' : 'mr-1'} />
              {!isSmall && 'Exportar'}
            </TableMenu>
          )}

          {onAdd && (
            <button
              type="button"
              onClick={onAdd}
              aria-label="Agregar"
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors shadow-sm"
            >
              <PlusCircle size={16} className={isSmall ? '' : 'mr-1'} />
              {!isSmall && 'Agregar'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
