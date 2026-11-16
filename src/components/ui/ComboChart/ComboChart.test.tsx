import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ComboChart } from './ComboChart'
import type { ChartDataRow } from '@/components/ui/BarChart/BarChart.types'

const data: ChartDataRow[] = [
  { month: 'Ene', gasto: 1000, presupuesto: 1200 },
  { month: 'Feb', gasto: 1300, presupuesto: 1200 },
  { month: 'Mar', gasto: 1100, presupuesto: 1200 },
]

describe('ComboChart', () => {
  it('renderiza con ariaLabel', () => {
    render(
      <ComboChart
        data={data}
        categoryKey="month"
        series={[
          { type: 'bar', key: 'gasto', label: 'Gasto real' },
          { type: 'line', key: 'presupuesto', label: 'Presupuesto' },
        ]}
        ariaLabel="Gasto vs presupuesto"
      />,
    )
    expect(screen.getByRole('img', { name: 'Gasto vs presupuesto' })).toBeInTheDocument()
  })

  it('muestra Skeleton cuando loading es true', () => {
    const { container } = render(
      <ComboChart
        data={data}
        categoryKey="month"
        series={[{ type: 'bar', key: 'gasto', label: 'Gasto' }]}
        ariaLabel="Cargando"
        loading
      />,
    )
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
  })

  it('muestra emptyMessage cuando no hay datos', () => {
    render(
      <ComboChart
        data={[]}
        categoryKey="month"
        series={[{ type: 'bar', key: 'gasto', label: 'Gasto' }]}
        ariaLabel="Vacío"
        emptyMessage="Sin datos combinados"
      />,
    )
    expect(screen.getByText('Sin datos combinados')).toBeInTheDocument()
  })

  it('renderiza tabla sr-only cuando accessibleData es true', () => {
    render(
      <ComboChart
        data={data}
        categoryKey="month"
        series={[
          { type: 'bar', key: 'gasto', label: 'Gasto real' },
          { type: 'line', key: 'presupuesto', label: 'Presupuesto' },
        ]}
        ariaLabel="Gasto vs presupuesto"
        accessibleData
      />,
    )
    expect(screen.getByRole('table', { hidden: true })).toBeInTheDocument()
    expect(screen.getByText('Feb')).toBeInTheDocument()
    expect(screen.getByText('1300')).toBeInTheDocument()
  })

  it('propaga className al contenedor raíz', () => {
    const { container } = render(
      <ComboChart
        data={data}
        categoryKey="month"
        series={[{ type: 'bar', key: 'gasto', label: 'Gasto' }]}
        ariaLabel="Test"
        className="custom-class"
      />,
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('acepta showRightAxis con series asignadas al eje derecho', () => {
    render(
      <ComboChart
        data={data}
        categoryKey="month"
        series={[
          { type: 'bar', key: 'gasto', label: 'Gasto', yAxisId: 'left' },
          {
            type: 'line',
            key: 'presupuesto',
            label: 'Presupuesto',
            yAxisId: 'right',
          },
        ]}
        ariaLabel="Doble eje"
        showRightAxis
      />,
    )
    expect(screen.getByRole('img', { name: 'Doble eje' })).toBeInTheDocument()
  })

  it('acepta series mixtas bar y line con curve linear', () => {
    render(
      <ComboChart
        data={data}
        categoryKey="month"
        series={[
          { type: 'bar', key: 'gasto', label: 'Gasto', color: 'primary' },
          {
            type: 'line',
            key: 'presupuesto',
            label: 'Presupuesto',
            color: 'scarlet',
            curve: 'linear',
            strokeDasharray: '5 5',
          },
        ]}
        ariaLabel="Mixto"
      />,
    )
    expect(screen.getByRole('img', { name: 'Mixto' })).toBeInTheDocument()
  })
})
