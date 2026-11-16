import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useColumnAdapter, getSearchableText, buildGlobalFilterFn } from './useColumnAdapter'
import type { ColumnDef } from './DataTable.types'
import type { Row } from '@tanstack/react-table'

interface TestRow {
  id: number
  name: string
  active: boolean
  amount: number
  createdAt: string
}

describe('useColumnAdapter', () => {
  it('returns an empty array for empty columns', () => {
    const { result } = renderHook(() => useColumnAdapter<TestRow>([]))
    expect(result.current).toEqual([])
  })

  it('maps field to accessorKey and id', () => {
    const columns: ColumnDef<TestRow>[] = [{ field: 'name', header: 'Nombre' }]
    const { result } = renderHook(() => useColumnAdapter(columns))
    expect(result.current[0]).toMatchObject({
      accessorKey: 'name',
      id: 'name',
      header: 'Nombre',
    })
  })

  it('sets enableSorting from sortable flag', () => {
    const columns: ColumnDef<TestRow>[] = [
      { field: 'name', header: 'Nombre', sortable: true },
      { field: 'id', header: 'ID' },
    ]
    const { result } = renderHook(() => useColumnAdapter(columns))
    expect(result.current[0].enableSorting).toBe(true)
    expect(result.current[1].enableSorting).toBe(false)
  })

  it('preserves original column in meta', () => {
    const columns: ColumnDef<TestRow>[] = [{ field: 'name', header: 'Nombre', width: 'w-40' }]
    const { result } = renderHook(() => useColumnAdapter(columns))
    const meta = result.current[0].meta as {
      width?: string
      originalColumn: ColumnDef<TestRow>
    }
    expect(meta.width).toBe('w-40')
    expect(meta.originalColumn).toBe(columns[0])
  })
})

describe('getSearchableText', () => {
  const row: TestRow = {
    id: 1,
    name: 'Diego',
    active: true,
    amount: 12500,
    createdAt: '2026-04-01T12:00:00.000Z',
  }

  it('returns empty string for null or undefined values', () => {
    const col: ColumnDef<TestRow> = { field: 'name', header: 'Nombre' }
    const emptyRow = { ...row, name: null as unknown as string }
    expect(getSearchableText(emptyRow, col)).toBe('')
  })

  it('uses getSearchText when provided', () => {
    const col: ColumnDef<TestRow> = {
      field: 'name',
      header: 'Nombre',
      getSearchText: (r) => `custom-${r.name}`,
    }
    expect(getSearchableText(row, col)).toBe('custom-Diego')
  })

  it('expands boolean true to spanish and english synonyms', () => {
    const col: ColumnDef<TestRow> = {
      field: 'active',
      header: 'Activo',
      type: 'boolean',
    }
    expect(getSearchableText(row, col)).toContain('si')
    expect(getSearchableText(row, col)).toContain('active')
  })

  it('expands boolean false to negative synonyms', () => {
    const col: ColumnDef<TestRow> = {
      field: 'active',
      header: 'Activo',
      type: 'boolean',
    }
    const inactiveRow = { ...row, active: false }
    expect(getSearchableText(inactiveRow, col)).toContain('no')
    expect(getSearchableText(inactiveRow, col)).toContain('inactivo')
  })

  it('ignores objects without getSearchText', () => {
    const col: ColumnDef<TestRow> = { field: 'name', header: 'Nombre' }
    const objectRow = { ...row, name: { label: 'Diego' } as unknown as string }
    expect(getSearchableText(objectRow, col)).toBe('')
  })

  it('keeps the scalar items of an array searchable', () => {
    const col: ColumnDef<TestRow> = { field: 'name', header: 'Nombre' }
    const arrayRow = { ...row, name: ['Uno', 'Dos', { label: 'Tres' }] as unknown as string }
    expect(getSearchableText(arrayRow, col)).toBe('uno dos')
  })

  it('lowercases default text values', () => {
    const col: ColumnDef<TestRow> = { field: 'name', header: 'Nombre' }
    expect(getSearchableText(row, col)).toBe('diego')
  })

  it('formats currency with es-CL locale and raw value', () => {
    const col: ColumnDef<TestRow> = {
      field: 'amount',
      header: 'Monto',
      type: 'currency',
    }
    const result = getSearchableText(row, col)
    expect(result).toContain('12500')
    expect(result).toContain('12.500')
  })

  it('handles date type without throwing', () => {
    const col: ColumnDef<TestRow> = {
      field: 'createdAt',
      header: 'Fecha',
      type: 'date',
    }
    expect(() => getSearchableText(row, col)).not.toThrow()
  })
})

describe('buildGlobalFilterFn', () => {
  const columns: ColumnDef<TestRow>[] = [
    { field: 'name', header: 'Nombre' },
    { field: 'active', header: 'Activo', type: 'boolean' },
  ]

  const makeRow = (original: TestRow): Row<TestRow> => ({ original }) as Row<TestRow>

  it('returns true when filter value is empty', () => {
    const fn = buildGlobalFilterFn(columns)
    const row = makeRow({
      id: 1,
      name: 'Diego',
      active: true,
      amount: 0,
      createdAt: '',
    })
    expect(fn(row, 'name', '')).toBe(true)
  })

  it('matches text in any column', () => {
    const fn = buildGlobalFilterFn(columns)
    const row = makeRow({
      id: 1,
      name: 'Diego',
      active: true,
      amount: 0,
      createdAt: '',
    })
    expect(fn(row, 'name', 'die')).toBe(true)
  })

  it('matches boolean synonyms', () => {
    const fn = buildGlobalFilterFn(columns)
    const row = makeRow({
      id: 1,
      name: 'X',
      active: true,
      amount: 0,
      createdAt: '',
    })
    expect(fn(row, 'name', 'activo')).toBe(true)
  })

  it('returns false when no column contains the term', () => {
    const fn = buildGlobalFilterFn(columns)
    const row = makeRow({
      id: 1,
      name: 'Diego',
      active: true,
      amount: 0,
      createdAt: '',
    })
    expect(fn(row, 'name', 'zzzz')).toBe(false)
  })
})
