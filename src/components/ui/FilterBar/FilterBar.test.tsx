import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilterBar } from './FilterBar'
import type { FilterDefinition } from './FilterBar.types'

const FILTERS: FilterDefinition[] = [
  {
    key: 'country',
    label: 'Pais',
    type: 'multi',
    options: [
      { value: 'cl', label: 'Chile' },
      { value: 'ar', label: 'Argentina' },
      { value: 'pe', label: 'Peru' },
    ],
  },
  {
    key: 'status',
    label: 'Estado',
    type: 'single',
    options: [
      { value: 'active', label: 'Activo' },
      { value: 'inactive', label: 'Inactivo' },
    ],
  },
]

const DATE_FILTERS: FilterDefinition[] = [
  {
    key: 'periodo',
    label: 'Periodo',
    type: 'dateRange',
  },
]

describe('FilterBar', () => {
  it('renderiza un combobox por cada filtro', () => {
    render(<FilterBar filters={FILTERS} values={{}} onChange={() => {}} onClear={() => {}} />)
    expect(screen.getByRole('combobox', { name: 'Pais' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Estado' })).toBeInTheDocument()
  })

  it('filtro multi dispara onChange con array de valores', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    function Wrapper() {
      const [values, setValues] = useState<Record<string, string[]>>({})
      return (
        <FilterBar
          filters={FILTERS}
          values={values}
          onChange={(key, next) => {
            onChange(key, next)
            setValues((prev) => ({ ...prev, [key]: next }))
          }}
          onClear={() => setValues({})}
        />
      )
    }
    render(<Wrapper />)
    await user.click(screen.getByRole('combobox', { name: 'Pais' }))
    await user.click(screen.getByRole('option', { name: 'Chile' }))
    expect(onChange).toHaveBeenLastCalledWith('country', ['cl'])
  })

  it('filtro single dispara onChange con array de 0 o 1 elemento', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    function Wrapper() {
      const [values, setValues] = useState<Record<string, string[]>>({})
      return (
        <FilterBar
          filters={FILTERS}
          values={values}
          onChange={(key, next) => {
            onChange(key, next)
            setValues((prev) => ({ ...prev, [key]: next }))
          }}
          onClear={() => setValues({})}
        />
      )
    }
    render(<Wrapper />)
    await user.click(screen.getByRole('combobox', { name: 'Estado' }))
    await user.click(screen.getByText('Activo'))
    expect(onChange).toHaveBeenLastCalledWith('status', ['active'])
  })

  it('no muestra "Limpiar filtros" cuando no hay valores activos', () => {
    render(<FilterBar filters={FILTERS} values={{}} onChange={() => {}} onClear={() => {}} />)
    expect(screen.queryByRole('button', { name: /Limpiar filtros/ })).not.toBeInTheDocument()
  })

  it('muestra "Limpiar filtros" cuando hay al menos un filtro activo', () => {
    render(
      <FilterBar
        filters={FILTERS}
        values={{ country: ['cl'] }}
        onChange={() => {}}
        onClear={() => {}}
      />,
    )
    expect(screen.getByRole('button', { name: /Limpiar filtros/ })).toBeInTheDocument()
  })

  it('click en "Limpiar filtros" llama a onClear', async () => {
    const user = userEvent.setup()
    const onClear = vi.fn()
    render(
      <FilterBar
        filters={FILTERS}
        values={{ country: ['cl'] }}
        onChange={() => {}}
        onClear={onClear}
      />,
    )
    await user.click(screen.getByRole('button', { name: /Limpiar filtros/ }))
    expect(onClear).toHaveBeenCalledTimes(1)
  })

  it('filtro disabled no abre el listbox al hacer click', async () => {
    const user = userEvent.setup()
    const disabled: FilterDefinition[] = [
      {
        key: 'country',
        label: 'Pais',
        type: 'multi',
        disabled: true,
        options: [{ value: 'cl', label: 'Chile' }],
      },
    ]
    render(<FilterBar filters={disabled} values={{}} onChange={() => {}} onClear={() => {}} />)
    const trigger = screen.getByRole('combobox', { name: 'Pais' })
    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })
})

describe('FilterBar (dateRange)', () => {
  it('renderiza los selectores "Desde" y "Hasta"', () => {
    render(<FilterBar filters={DATE_FILTERS} values={{}} onChange={() => {}} onClear={() => {}} />)
    expect(screen.getByRole('button', { name: 'Desde' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hasta' })).toBeInTheDocument()
  })

  it('seleccionar una fecha en "Desde" dispara onChange con [fecha, ""]', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    function Wrapper() {
      const [values, setValues] = useState<Record<string, string[]>>({})
      return (
        <FilterBar
          filters={DATE_FILTERS}
          values={values}
          onChange={(key, next) => {
            onChange(key, next)
            setValues((prev) => ({ ...prev, [key]: next }))
          }}
          onClear={() => setValues({})}
        />
      )
    }
    render(<Wrapper />)
    await user.click(screen.getByRole('button', { name: 'Desde' }))
    const day15 = await screen.findByRole('button', { name: /15/ })
    await user.click(day15)
    await waitFor(() => expect(onChange).toHaveBeenCalled())
    const [key, range] = onChange.mock.calls[0]
    expect(key).toBe('periodo')
    expect(range[0]).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(range[1]).toBe('')
  })

  it('limpiar "Desde" preserva el valor de "Hasta"', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <FilterBar
        filters={DATE_FILTERS}
        values={{ periodo: ['2026-03-01', '2026-05-01'] }}
        onChange={onChange}
        onClear={() => {}}
      />,
    )
    const clearButtons = screen.getAllByLabelText('Limpiar fecha')
    await user.click(clearButtons[0])
    expect(onChange).toHaveBeenLastCalledWith('periodo', ['', '2026-05-01'])
  })

  it('un rango con al menos un extremo definido muestra "Limpiar filtros"', () => {
    render(
      <FilterBar
        filters={DATE_FILTERS}
        values={{ periodo: ['2026-03-01', ''] }}
        onChange={() => {}}
        onClear={() => {}}
      />,
    )
    expect(screen.getByRole('button', { name: /Limpiar filtros/ })).toBeInTheDocument()
  })

  it('un rango sin extremos no muestra "Limpiar filtros"', () => {
    render(
      <FilterBar
        filters={DATE_FILTERS}
        values={{ periodo: ['', ''] }}
        onChange={() => {}}
        onClear={() => {}}
      />,
    )
    expect(screen.queryByRole('button', { name: /Limpiar filtros/ })).not.toBeInTheDocument()
  })
})
