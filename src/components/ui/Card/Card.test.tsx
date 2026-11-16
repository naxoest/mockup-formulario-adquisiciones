import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Card } from './Card'

describe('Card', () => {
  it('renderiza children con clases base', () => {
    const { container } = render(<Card>contenido</Card>)
    expect(screen.getByText('contenido')).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('bg-white', 'rounded-lg', 'border')
  })

  it('aplica className adicional sin pisar las base', () => {
    const { container } = render(<Card className="mt-4">x</Card>)
    expect(container.firstChild).toHaveClass('mt-4', 'bg-white')
  })

  it('aplica clases de hover cuando hoverable es true', () => {
    const { container } = render(<Card hoverable>x</Card>)
    expect(container.firstChild).toHaveClass('cursor-pointer')
  })

  it('renderiza como elemento article cuando as="article"', () => {
    const { container } = render(<Card as="article">x</Card>)
    expect((container.firstChild as HTMLElement).tagName).toBe('ARTICLE')
  })

  it('renderiza Card.Header con Card.Title y Card.Actions', () => {
    render(
      <Card>
        <Card.Header>
          <Card.Title>Titulo</Card.Title>
          <Card.Actions>
            <button>boton</button>
          </Card.Actions>
        </Card.Header>
      </Card>,
    )
    expect(screen.getByRole('heading', { level: 3, name: 'Titulo' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'boton' })).toBeInTheDocument()
  })

  it('Card.Body aplica padding por defecto y lo quita con noPadding', () => {
    const { rerender, container } = render(
      <Card>
        <Card.Body>x</Card.Body>
      </Card>,
    )
    expect(container.querySelector('.p-6')).not.toBeNull()

    rerender(
      <Card>
        <Card.Body noPadding>x</Card.Body>
      </Card>,
    )
    expect(container.querySelector('.p-6')).toBeNull()
  })

  it('Card.Body aplica overflow x-auto', () => {
    const { container } = render(
      <Card>
        <Card.Body overflow="x-auto">x</Card.Body>
      </Card>,
    )
    expect(container.querySelector('.overflow-x-auto')).not.toBeNull()
  })

  it('Card.Footer renderiza contenido sin divisor superior', () => {
    const { container } = render(
      <Card>
        <Card.Footer>pie</Card.Footer>
      </Card>,
    )
    expect(screen.getByText('pie')).toBeInTheDocument()
    expect(container.querySelector('.border-t')).toBeNull()
  })

  it('propaga props HTML al elemento raíz', () => {
    render(<Card data-testid="card-root">x</Card>)
    expect(screen.getByTestId('card-root')).toBeInTheDocument()
  })
})
