import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { BarChart } from './BarChart'
import type { ChartDataRow } from './BarChart.types'

const data: ChartDataRow[] = [
  { month: 'Ene', ventas: 100, costos: 60 },
  { month: 'Feb', ventas: 120, costos: 70 },
  { month: 'Mar', ventas: 90, costos: 50 },
]

describe('BarChart', () => {
  it('renderiza con ariaLabel', () => {
    render(
      <BarChart
        data={data}
        categoryKey="month"
        series={[{ key: 'ventas', label: 'Ventas' }]}
        ariaLabel="Ventas por mes"
      />,
    )
    expect(screen.getByRole('img', { name: 'Ventas por mes' })).toBeInTheDocument()
  })

  it('muestra Skeleton cuando loading es true', () => {
    const { container } = render(
      <BarChart
        data={data}
        categoryKey="month"
        series={[{ key: 'ventas', label: 'Ventas' }]}
        ariaLabel="Cargando"
        loading
      />,
    )
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
  })

  it('muestra emptyMessage cuando no hay datos', () => {
    render(
      <BarChart
        data={[]}
        categoryKey="month"
        series={[{ key: 'ventas', label: 'Ventas' }]}
        ariaLabel="Vacío"
        emptyMessage="No hay registros"
      />,
    )
    expect(screen.getByText('No hay registros')).toBeInTheDocument()
  })

  it('renderiza tabla sr-only cuando accessibleData es true', () => {
    render(
      <BarChart
        data={data}
        categoryKey="month"
        series={[
          { key: 'ventas', label: 'Ventas' },
          { key: 'costos', label: 'Costos' },
        ]}
        ariaLabel="Ventas y costos"
        accessibleData
      />,
    )
    expect(screen.getByRole('table', { hidden: true })).toBeInTheDocument()
    expect(screen.getByText('Ene')).toBeInTheDocument()
    expect(screen.getByText('120')).toBeInTheDocument()
  })

  it('no renderiza tabla sr-only por defecto', () => {
    render(
      <BarChart
        data={data}
        categoryKey="month"
        series={[{ key: 'ventas', label: 'Ventas' }]}
        ariaLabel="Sin tabla"
      />,
    )
    expect(screen.queryByRole('table', { hidden: true })).not.toBeInTheDocument()
  })

  it('propaga className al contenedor raíz', () => {
    const { container } = render(
      <BarChart
        data={data}
        categoryKey="month"
        series={[{ key: 'ventas', label: 'Ventas' }]}
        ariaLabel="Test"
        className="custom-class"
      />,
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('acepta orientation horizontal sin romper', () => {
    render(
      <BarChart
        data={data}
        categoryKey="month"
        series={[{ key: 'ventas', label: 'Ventas' }]}
        ariaLabel="Horizontal"
        orientation="horizontal"
      />,
    )
    expect(screen.getByRole('img', { name: 'Horizontal' })).toBeInTheDocument()
  })

  it('acepta layout stacked sin romper', () => {
    render(
      <BarChart
        data={data}
        categoryKey="month"
        series={[
          { key: 'ventas', label: 'Ventas' },
          { key: 'costos', label: 'Costos' },
        ]}
        ariaLabel="Apilado"
        layout="stacked"
      />,
    )
    expect(screen.getByRole('img', { name: 'Apilado' })).toBeInTheDocument()
  })

  it('acepta showValueLabels sin romper', () => {
    render(
      <BarChart
        data={data}
        categoryKey="month"
        series={[{ key: 'ventas', label: 'Ventas' }]}
        ariaLabel="Con etiquetas"
        showValueLabels
        formatValue={(value) => `$${value}`}
      />,
    )
    expect(screen.getByRole('img', { name: 'Con etiquetas' })).toBeInTheDocument()
  })

  it('acepta formatCompactValue sin romper', () => {
    render(
      <BarChart
        data={data}
        categoryKey="month"
        series={[{ key: 'ventas', label: 'Ventas' }]}
        ariaLabel="Eje compacto"
        formatValue={(value) => `$${value}`}
        formatCompactValue={(value) => `${value / 1000}k`}
      />,
    )
    expect(screen.getByRole('img', { name: 'Eje compacto' })).toBeInTheDocument()
  })

  it('acepta tone en la serie sin romper', () => {
    render(
      <BarChart
        data={data}
        categoryKey="month"
        series={[{ key: 'ventas', label: 'Ventas', color: 'mercury', tone: 500 }]}
        ariaLabel="Con tono"
      />,
    )
    expect(screen.getByRole('img', { name: 'Con tono' })).toBeInTheDocument()
  })
})
