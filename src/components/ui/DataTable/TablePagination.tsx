import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Table } from '@tanstack/react-table'
import { cn } from '@/utils/cn'

interface TablePaginationProps<T> {
  table: Table<T>
  totalRows?: number
}

export function TablePagination<T>({ table, totalRows }: TablePaginationProps<T>) {
  const { pageIndex, pageSize } = table.getState().pagination
  const pageCount = table.getPageCount()
  const totalItems = totalRows ?? table.getFilteredRowModel().rows.length

  const startItem = pageIndex * pageSize + 1
  const endItem = Math.min((pageIndex + 1) * pageSize, totalItems)

  const getVisiblePages = (): number[] => {
    const pages: number[] = []
    const currentPage = pageIndex + 1

    if (pageCount <= 5) {
      for (let i = 1; i <= pageCount; i++) pages.push(i)
    } else if (currentPage <= 3) {
      for (let i = 1; i <= 5; i++) pages.push(i)
    } else if (currentPage >= pageCount - 2) {
      for (let i = pageCount - 4; i <= pageCount; i++) pages.push(i)
    } else {
      for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i)
    }

    return pages
  }

  const visiblePages = getVisiblePages()
  const canPrev = table.getCanPreviousPage()
  const canNext = table.getCanNextPage()

  const goToPrevious = () => {
    if (canPrev) table.previousPage()
  }

  const goToNext = () => {
    if (canNext) table.nextPage()
  }

  return (
    <div className="px-4 py-3 sm:px-6">
      <div className="flex items-center justify-between gap-2">
        <nav
          className="flex flex-1 items-center justify-between gap-2 sm:hidden"
          aria-label="Paginación"
        >
          <button
            type="button"
            onClick={goToPrevious}
            aria-disabled={!canPrev}
            className={cn(
              'relative inline-flex items-center px-3 py-2 border text-sm font-medium rounded-lg transition-colors',
              canPrev
                ? 'border-mercury-300 bg-white text-mercury-700 hover:bg-mercury-50'
                : 'border-mercury-200 bg-white text-mercury-300 cursor-not-allowed',
            )}
          >
            Anterior
          </button>

          <span role="status" className="text-xs text-mercury-600 font-medium">
            Página {pageIndex + 1} de {Math.max(pageCount, 1)}
          </span>

          <button
            type="button"
            onClick={goToNext}
            aria-disabled={!canNext}
            className={cn(
              'relative inline-flex items-center px-3 py-2 border text-sm font-medium rounded-lg transition-colors',
              canNext
                ? 'border-mercury-300 bg-white text-mercury-700 hover:bg-mercury-50'
                : 'border-mercury-200 bg-white text-mercury-300 cursor-not-allowed',
            )}
          >
            Siguiente
          </button>
        </nav>

        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <p role="status" className="text-sm text-mercury-700">
            Mostrando <span className="font-medium">{totalItems > 0 ? startItem : 0}</span> a{' '}
            <span className="font-medium">{endItem}</span> de{' '}
            <span className="font-medium">{totalItems}</span> resultados
          </p>

          <nav
            className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px"
            aria-label="Paginación"
          >
            <button
              type="button"
              onClick={goToPrevious}
              aria-disabled={!canPrev}
              className={cn(
                'relative inline-flex items-center px-2 py-2 rounded-l-lg border text-sm font-medium',
                canPrev
                  ? 'border-mercury-300 bg-white text-mercury-500 hover:bg-mercury-50'
                  : 'border-mercury-200 bg-white text-mercury-300 cursor-not-allowed',
              )}
            >
              <span className="sr-only">Anterior</span>
              <ChevronLeft size={18} aria-hidden="true" />
            </button>

            {visiblePages.map((pageNum) => {
              const isActive = pageIndex + 1 === pageNum
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => table.setPageIndex(pageNum - 1)}
                  aria-label={`Página ${pageNum}`}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                    isActive
                      ? 'bg-primary-600 border-primary-600 text-white z-10'
                      : 'bg-white border-mercury-300 text-mercury-500 hover:bg-mercury-50',
                  )}
                >
                  {pageNum}
                </button>
              )
            })}

            <button
              type="button"
              onClick={goToNext}
              aria-disabled={!canNext}
              className={cn(
                'relative inline-flex items-center px-2 py-2 rounded-r-lg border text-sm font-medium',
                canNext
                  ? 'border-mercury-300 bg-white text-mercury-500 hover:bg-mercury-50'
                  : 'border-mercury-200 bg-white text-mercury-300 cursor-not-allowed',
              )}
            >
              <span className="sr-only">Siguiente</span>
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  )
}
