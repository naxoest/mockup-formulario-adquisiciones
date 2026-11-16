import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SystemLogo } from './SystemLogo'

describe('SystemLogo', () => {
  it('renders the SVG with role img', () => {
    render(<SystemLogo />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('renders default text "ADQUISICIONES" when variant is full', () => {
    render(<SystemLogo />)
    expect(screen.getByText('ADQUISICIONES')).toBeInTheDocument()
  })

  it('renders custom text when provided', () => {
    render(<SystemLogo text="MI SISTEMA" />)
    expect(screen.getByText('MI SISTEMA')).toBeInTheDocument()
  })

  it('does not render text when variant is mini', () => {
    render(<SystemLogo variant="mini" />)
    expect(screen.queryByText('ADQUISICIONES')).not.toBeInTheDocument()
  })

  it('uses a fixed viewBox when variant is mini', () => {
    const { container } = render(<SystemLogo variant="mini" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('viewBox', '70 0 40 38')
  })

  it('applies custom className', () => {
    const { container } = render(<SystemLogo className="h-8" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('h-8')
  })

  it('sets aria-label including text in full variant', () => {
    render(<SystemLogo text="TEST" />)
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Logo del sistema TEST')
  })

  it('sets generic aria-label in mini variant', () => {
    render(<SystemLogo variant="mini" />)
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Logo del sistema')
  })

  it('applies white color mode to the main text', () => {
    const { container } = render(<SystemLogo colorMode="white" />)
    const textEl = container.querySelector('text')
    expect(textEl).toHaveAttribute('fill', 'white')
  })

  it('applies currentColor in custom color mode to the main text', () => {
    const { container } = render(<SystemLogo colorMode="custom" />)
    const textEl = container.querySelector('text')
    expect(textEl).toHaveAttribute('fill', 'currentColor')
  })
})
