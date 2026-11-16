import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { PieChart } from './PieChart'
import type { PieChartDataPoint } from './PieChart.types'

const data: PieChartDataPoint[] = [
  { key: 'insumos', label: 'Insumos', value: 450 },
  { key: 'servicios', label: 'Servicios', value: 280 },
  { key: 'equipos', label: 'Equipos', value: 170 },
]

describe('PieChart', () => {
  it('renderiza con ariaLabel', () => {
    render(<PieChart data={data} ariaLabel="Distribución de gastos" />)
    expect(screen.getByRole('img', { name: 'Distribución de gastos' })).toBeInTheDocument()
  })

  it('muestra Skeleton cuando loading es true', () => {
    const { container } = render(<PieChart data={data} ariaLabel="Cargando" loading />)
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
  })

  it('muestra emptyMessage cuando no hay datos', () => {
    render(<PieChart data={[]} ariaLabel="Vacío" emptyMessage="Sin distribución" />)
    expect(screen.getByText('Sin distribución')).toBeInTheDocument()
  })

  it('renderiza tabla sr-only cuando accessibleData es true', () => {
    render(<PieChart data={data} ariaLabel="Distribución" accessibleData />)
    expect(screen.getByRole('table', { hidden: true })).toBeInTheDocument()
    expect(screen.getByText('Insumos')).toBeInTheDocument()
    expect(screen.getByText('450')).toBeInTheDocument()
  })

  it('no renderiza tabla sr-only por defecto', () => {
    render(<PieChart data={data} ariaLabel="Sin tabla" />)
    expect(screen.queryByRole('table', { hidden: true })).not.toBeInTheDocument()
  })

  it('propaga className al contenedor raíz', () => {
    const { container } = render(<PieChart data={data} ariaLabel="Test" className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('acepta variant pie sin romper', () => {
    render(<PieChart data={data} ariaLabel="Pie" variant="pie" />)
    expect(screen.getByRole('img', { name: 'Pie' })).toBeInTheDocument()
  })

  it('acepta colores custom por punto', () => {
    render(
      <PieChart
        data={[
          { key: 'a', label: 'A', value: 50, color: 'primary' },
          { key: 'b', label: 'B', value: 30, color: 'scarlet' },
        ]}
        ariaLabel="Colores"
      />,
    )
    expect(screen.getByRole('img', { name: 'Colores' })).toBeInTheDocument()
  })
})
