import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { LineChart } from './LineChart'
import type { ChartDataRow } from '@/components/ui/BarChart/BarChart.types'

const data: ChartDataRow[] = [
  { month: 'Ene', real: 100, presupuesto: 120 },
  { month: 'Feb', real: 130, presupuesto: 120 },
  { month: 'Mar', real: 110, presupuesto: 120 },
]

describe('LineChart', () => {
  it('renderiza con ariaLabel', () => {
    render(
      <LineChart
        data={data}
        categoryKey="month"
        series={[{ key: 'real', label: 'Real' }]}
        ariaLabel="Evolución mensual"
      />,
    )
    expect(screen.getByRole('img', { name: 'Evolución mensual' })).toBeInTheDocument()
  })

  it('muestra Skeleton cuando loading es true', () => {
    const { container } = render(
      <LineChart
        data={data}
        categoryKey="month"
        series={[{ key: 'real', label: 'Real' }]}
        ariaLabel="Cargando"
        loading
      />,
    )
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
  })

  it('muestra emptyMessage cuando no hay datos', () => {
    render(
      <LineChart
        data={[]}
        categoryKey="month"
        series={[{ key: 'real', label: 'Real' }]}
        ariaLabel="Vacío"
        emptyMessage="Sin registros"
      />,
    )
    expect(screen.getByText('Sin registros')).toBeInTheDocument()
  })

  it('renderiza tabla sr-only cuando accessibleData es true', () => {
    render(
      <LineChart
        data={data}
        categoryKey="month"
        series={[
          { key: 'real', label: 'Real' },
          { key: 'presupuesto', label: 'Presupuesto' },
        ]}
        ariaLabel="Real vs presupuesto"
        accessibleData
      />,
    )
    expect(screen.getByRole('table', { hidden: true })).toBeInTheDocument()
    expect(screen.getByText('Feb')).toBeInTheDocument()
    expect(screen.getByText('130')).toBeInTheDocument()
  })

  it('propaga className al contenedor raíz', () => {
    const { container } = render(
      <LineChart
        data={data}
        categoryKey="month"
        series={[{ key: 'real', label: 'Real' }]}
        ariaLabel="Test"
        className="custom-class"
      />,
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('acepta múltiples series sin romper', () => {
    render(
      <LineChart
        data={data}
        categoryKey="month"
        series={[
          { key: 'real', label: 'Real', color: 'primary' },
          { key: 'presupuesto', label: 'Presupuesto', color: 'scarlet', strokeDasharray: '5 5' },
        ]}
        ariaLabel="Multi serie"
      />,
    )
    expect(screen.getByRole('img', { name: 'Multi serie' })).toBeInTheDocument()
  })

  it('acepta curve linear sin romper', () => {
    render(
      <LineChart
        data={data}
        categoryKey="month"
        series={[{ key: 'real', label: 'Real', curve: 'linear' }]}
        ariaLabel="Lineal"
      />,
    )
    expect(screen.getByRole('img', { name: 'Lineal' })).toBeInTheDocument()
  })

  it('acepta formatCompactValue sin romper', () => {
    render(
      <LineChart
        data={data}
        categoryKey="month"
        series={[{ key: 'real', label: 'Real' }]}
        ariaLabel="Eje compacto"
        formatValue={(value) => `$${value}`}
        formatCompactValue={(value) => `${value / 1000}k`}
      />,
    )
    expect(screen.getByRole('img', { name: 'Eje compacto' })).toBeInTheDocument()
  })

  it('acepta tone en la serie sin romper', () => {
    render(
      <LineChart
        data={data}
        categoryKey="month"
        series={[{ key: 'real', label: 'Real', color: 'mercury', tone: 500 }]}
        ariaLabel="Con tono"
      />,
    )
    expect(screen.getByRole('img', { name: 'Con tono' })).toBeInTheDocument()
  })
})
