import { useMemo } from 'react'
import type { ColumnDef as TanstackColumnDef, Row } from '@tanstack/react-table'
import type { ColumnDef } from './DataTable.types'

export function useColumnAdapter<T>(columns: ColumnDef<T>[]): TanstackColumnDef<T>[] {
  return useMemo(() => {
    if (!columns || columns.length === 0) return []

    return columns.map((col) => ({
      accessorKey: col.field,
      id: col.field,
      header: col.header,
      cell: col.renderCell
        ? ({ row }) => col.renderCell!(row.original)
        : ({ getValue }) => {
            const value = getValue()
            return value !== null && value !== undefined ? String(value) : '—'
          },
      enableSorting: col.sortable ?? false,
      meta: {
        width: col.width,
        type: col.type,
        currency: col.currency,
        originalColumn: col,
      },
    }))
  }, [columns])
}

function isScalar(value: unknown): boolean {
  return typeof value !== 'object' || value === null || value instanceof Date
}

export function getSearchableText<T>(row: T, column: ColumnDef<T>): string {
  const value = (row as Record<string, unknown>)[column.field]

  if (value === null || value === undefined) return ''

  if (column.getSearchText) {
    return String(column.getSearchText(row))
  }

  if (Array.isArray(value)) {
    return value.filter(isScalar).join(' ').toLowerCase()
  }

  if (!isScalar(value)) return ''

  switch (column.type) {
    case 'boolean':
      return value ? 'si yes true activo active' : 'no false inactivo inactive'

    case 'status': {
      const status = String(value).toLowerCase()
      const statusText: Record<string, string> = {
        active: 'activo active habilitado enabled',
        inactive: 'inactivo inactive deshabilitado disabled',
        pending: 'pendiente pending esperando waiting',
      }
      return statusText[status] ?? String(value)
    }

    case 'date':
    case 'datetime':
      try {
        const date = new Date(value as string | number | Date)
        return `${date.toLocaleDateString()} ${date.toISOString()}`
      } catch {
        return String(value)
      }

    case 'currency':
      return `${value} ${new Intl.NumberFormat('es-CL').format(value as number)}`

    default:
      return String(value).toLowerCase()
  }
}

export function buildGlobalFilterFn<T>(columns: ColumnDef<T>[]) {
  return (row: Row<T>, _columnId: string, filterValue: string): boolean => {
    if (!filterValue) return true
    const searchTerm = filterValue.toLowerCase()
    return columns.some((col) => {
      const text = getSearchableText(row.original, col)
      return text.toLowerCase().includes(searchTerm)
    })
  }
}
