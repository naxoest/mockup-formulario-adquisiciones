import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Spinner } from './Spinner'

describe('Spinner', () => {
  it('renders an svg element', () => {
    const { container } = render(<Spinner />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('applies animate-spin class', () => {
    const { container } = render(<Spinner />)
    expect(container.querySelector('svg')).toHaveClass('animate-spin')
  })

  it('applies md size by default', () => {
    const { container } = render(<Spinner />)
    expect(container.querySelector('svg')).toHaveClass('size-5')
  })

  it('applies sm size', () => {
    const { container } = render(<Spinner size="sm" />)
    expect(container.querySelector('svg')).toHaveClass('size-4')
  })

  it('applies lg size', () => {
    const { container } = render(<Spinner size="lg" />)
    expect(container.querySelector('svg')).toHaveClass('size-6')
  })

  it('merges custom className', () => {
    const { container } = render(<Spinner className="text-red-500" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('text-red-500')
    expect(svg).toHaveClass('animate-spin')
  })

  it('forwards additional props to svg', () => {
    const { container } = render(
      <Spinner data-testid="custom" role="status" aria-label="Loading" />,
    )
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('data-testid', 'custom')
    expect(svg).toHaveAttribute('role', 'status')
    expect(svg).toHaveAttribute('aria-label', 'Loading')
  })
})
