import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Badge } from './Badge'

describe('Badge', () => {
  it('renderiza el contenido', () => {
    render(<Badge>Activo</Badge>)
    expect(screen.getByText('Activo')).toBeInTheDocument()
  })

  it('aplica la variante neutral por defecto', () => {
    render(<Badge>Estado</Badge>)
    expect(screen.getByText('Estado')).toHaveClass('bg-mercury-100')
  })

  it('aplica las clases de cada variante', () => {
    const { rerender } = render(<Badge variant="info">x</Badge>)
    expect(screen.getByText('x')).toHaveClass('bg-primary-100')

    rerender(<Badge variant="success">x</Badge>)
    expect(screen.getByText('x')).toHaveClass('bg-jade-100')

    rerender(<Badge variant="warning">x</Badge>)
    expect(screen.getByText('x')).toHaveClass('bg-saffron-100')

    rerender(<Badge variant="error">x</Badge>)
    expect(screen.getByText('x')).toHaveClass('bg-scarlet-100')
  })

  it('aplica el tamaño md por defecto', () => {
    render(<Badge>Estado</Badge>)
    expect(screen.getByText('Estado')).toHaveClass('text-sm')
  })

  it('aplica las clases de cada tamaño', () => {
    const { rerender } = render(<Badge size="sm">x</Badge>)
    expect(screen.getByText('x')).toHaveClass('text-xs')

    rerender(<Badge size="lg">x</Badge>)
    expect(screen.getByText('x')).toHaveClass('px-3')
  })

  it('renderiza el dot cuando dot es true', () => {
    const { container } = render(<Badge dot>Activo</Badge>)
    expect(container.querySelector('span[aria-hidden="true"]')).toBeInTheDocument()
  })

  it('no renderiza el dot por defecto', () => {
    const { container } = render(<Badge>Activo</Badge>)
    expect(container.querySelector('span[aria-hidden="true"]')).not.toBeInTheDocument()
  })

  it('renderiza el icono cuando se pasa', () => {
    render(<Badge icon={<svg data-testid="badge-icon" />}>Activo</Badge>)
    expect(screen.getByTestId('badge-icon')).toBeInTheDocument()
  })

  it('propaga props HTML del span', () => {
    render(<Badge data-testid="badge-root">Activo</Badge>)
    expect(screen.getByTestId('badge-root')).toBeInTheDocument()
  })

  it('combina className personalizada', () => {
    render(<Badge className="custom-class">Activo</Badge>)
    expect(screen.getByText('Activo')).toHaveClass('custom-class')
  })
})
