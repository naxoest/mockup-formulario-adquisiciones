import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import type { ReactNode } from 'react'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}))

import { PageHeader } from './PageHeader'

describe('PageHeader', () => {
  it('renderiza el título como h1', () => {
    render(<PageHeader title="Productos" />)
    expect(screen.getByRole('heading', { level: 1, name: 'Productos' })).toBeInTheDocument()
  })

  it('renderiza la descripción cuando está presente', () => {
    render(<PageHeader title="x" description="Lista completa" />)
    expect(screen.getByText('Lista completa')).toBeInTheDocument()
  })

  it('omite la descripción cuando no se pasa', () => {
    const { container } = render(<PageHeader title="x" />)
    expect(container.querySelector('p')).toBeNull()
  })

  it('renderiza el ícono dentro del tile cuando se pasa', () => {
    render(<PageHeader title="x" icon={<svg data-testid="icon-test" />} />)
    expect(screen.getByTestId('icon-test')).toBeInTheDocument()
  })

  it('no renderiza tile de ícono cuando no se pasa icon', () => {
    const { container } = render(<PageHeader title="x" />)
    expect(container.querySelector('.bg-primary-100')).toBeNull()
  })

  it('renderiza acciones cuando se pasan', () => {
    render(<PageHeader title="x" actions={<button>nuevo</button>} />)
    expect(screen.getByRole('button', { name: 'nuevo' })).toBeInTheDocument()
  })

  it('renderiza Breadcrumbs cuando hay items', () => {
    render(
      <PageHeader
        title="x"
        breadcrumbs={[{ label: 'Modulo', href: '/m' }, { label: 'Detalle' }]}
      />,
    )
    expect(screen.getByText('Modulo')).toBeInTheDocument()
    expect(screen.getByText('Detalle')).toBeInTheDocument()
  })

  it('no renderiza el contenedor derecho cuando no hay actions ni breadcrumbs', () => {
    render(<PageHeader title="x" />)
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('aplica className adicional al contenedor raíz', () => {
    const { container } = render(<PageHeader title="x" className="mt-8" />)
    expect(container.firstChild).toHaveClass('mt-8')
  })
})
