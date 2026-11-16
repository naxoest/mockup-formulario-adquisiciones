import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Section } from './Section'

describe('Section', () => {
  it('renderiza children', () => {
    render(<Section>contenido</Section>)
    expect(screen.getByText('contenido')).toBeInTheDocument()
  })

  it('renderiza como <section> cuando hay title', () => {
    render(<Section title="Encabezado">x</Section>)
    expect(screen.getByRole('region', { name: 'Encabezado' })).toBeInTheDocument()
  })

  it('renderiza como <section> con aria-label cuando hay ariaLabel sin title', () => {
    render(<Section ariaLabel="Acciones">x</Section>)
    expect(screen.getByRole('region', { name: 'Acciones' })).toBeInTheDocument()
  })

  it('renderiza como <div> cuando no hay title ni ariaLabel', () => {
    const { container } = render(<Section>x</Section>)
    expect((container.firstChild as HTMLElement).tagName).toBe('DIV')
  })

  it('conecta title con aria-labelledby', () => {
    render(<Section title="Encabezado">x</Section>)
    const region = screen.getByRole('region')
    const heading = screen.getByRole('heading', { name: 'Encabezado' })
    expect(region.getAttribute('aria-labelledby')).toBe(heading.id)
  })

  it('renderiza heading h2 por defecto', () => {
    render(<Section title="Encabezado">x</Section>)
    expect(screen.getByRole('heading', { level: 2, name: 'Encabezado' })).toBeInTheDocument()
  })

  it('respeta headingLevel="3"', () => {
    render(
      <Section title="Encabezado" headingLevel={3}>
        x
      </Section>,
    )
    expect(screen.getByRole('heading', { level: 3, name: 'Encabezado' })).toBeInTheDocument()
  })

  it('renderiza description cuando se pasa', () => {
    render(
      <Section title="t" description="info adicional">
        x
      </Section>,
    )
    expect(screen.getByText('info adicional')).toBeInTheDocument()
  })

  it('renderiza actions cuando se pasan', () => {
    render(
      <Section title="t" actions={<button>nuevo</button>}>
        x
      </Section>,
    )
    expect(screen.getByRole('button', { name: 'nuevo' })).toBeInTheDocument()
  })

  it('aplica className adicional', () => {
    const { container } = render(
      <Section title="t" className="mt-8">
        x
      </Section>,
    )
    expect(container.firstChild).toHaveClass('mt-8')
  })

  it('no renderiza header cuando no hay title ni actions', () => {
    const { container } = render(<Section>solo contenido</Section>)
    expect(container.querySelector('h2, h3, h4')).toBeNull()
  })
})
