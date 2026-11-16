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

import { Breadcrumbs } from './Breadcrumbs'

describe('Breadcrumbs', () => {
  it('renderiza el item Home por defecto', () => {
    render(<Breadcrumbs items={[]} />)
    expect(screen.getByText('Inicio')).toBeInTheDocument()
  })

  it('omite Home cuando showHome es false', () => {
    render(<Breadcrumbs items={[{ label: 'Modulo' }]} showHome={false} />)
    expect(screen.queryByText('Inicio')).not.toBeInTheDocument()
  })

  it('renderiza items con href como link y el último como span', () => {
    render(
      <Breadcrumbs items={[{ label: 'Productos', href: '/productos' }, { label: 'Detalle' }]} />,
    )
    expect(screen.getByText('Productos').tagName).toBe('A')
    expect(screen.getByText('Detalle').tagName).toBe('SPAN')
  })

  it('marca el último item con aria-current="page"', () => {
    render(<Breadcrumbs items={[{ label: 'Detalle' }]} />)
    expect(screen.getByText('Detalle')).toHaveAttribute('aria-current', 'page')
  })

  it('retorna null cuando no hay home ni items', () => {
    const { container } = render(<Breadcrumbs items={[]} showHome={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('respeta homeHref personalizado', () => {
    render(<Breadcrumbs items={[]} homeHref="/dashboard" />)
    const link = screen.getByText('Inicio').closest('a')
    expect(link).toHaveAttribute('href', '/dashboard')
  })

  it('aplica nav con aria-label Breadcrumb', () => {
    render(<Breadcrumbs items={[{ label: 'x' }]} />)
    expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Breadcrumb')
  })
})
