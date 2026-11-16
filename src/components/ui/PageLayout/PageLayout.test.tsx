import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PageLayout } from './PageLayout'

describe('PageLayout', () => {
  it('renderiza children', () => {
    render(<PageLayout>contenido</PageLayout>)
    expect(screen.getByText('contenido')).toBeInTheDocument()
  })

  it('aplica padding estándar y overflow-x-hidden por defecto', () => {
    const { container } = render(<PageLayout>x</PageLayout>)
    const root = container.firstChild as HTMLElement
    expect(root).toHaveClass('px-4', 'sm:px-6', 'lg:px-8', 'py-6', 'overflow-x-hidden')
  })

  it('aplica max-w-7xl mx-auto por defecto', () => {
    const { container } = render(<PageLayout>x</PageLayout>)
    expect(container.firstChild).toHaveClass('max-w-7xl', 'mx-auto')
  })

  it('omite max-width cuando maxWidth="none"', () => {
    const { container } = render(<PageLayout maxWidth="none">x</PageLayout>)
    const root = container.firstChild as HTMLElement
    expect(root).not.toHaveClass('mx-auto')
    expect(root.className).not.toMatch(/max-w-/)
  })

  it('aplica space-y-8 con spacing="normal" por defecto', () => {
    const { container } = render(<PageLayout>x</PageLayout>)
    expect(container.firstChild).toHaveClass('space-y-8')
  })

  it('aplica space-y-4 con spacing="tight"', () => {
    const { container } = render(<PageLayout spacing="tight">x</PageLayout>)
    expect(container.firstChild).toHaveClass('space-y-4')
  })

  it('omite space-y con spacing="none"', () => {
    const { container } = render(<PageLayout spacing="none">x</PageLayout>)
    const root = container.firstChild as HTMLElement
    expect(root.className).not.toMatch(/space-y-/)
  })

  it('aplica className adicional', () => {
    const { container } = render(<PageLayout className="bg-red-50">x</PageLayout>)
    expect(container.firstChild).toHaveClass('bg-red-50')
  })

  it('propaga props HTML', () => {
    render(<PageLayout data-testid="page-root">x</PageLayout>)
    expect(screen.getByTestId('page-root')).toBeInTheDocument()
  })
})
