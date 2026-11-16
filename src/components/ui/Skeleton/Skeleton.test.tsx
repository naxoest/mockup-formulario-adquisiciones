import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Skeleton } from './Skeleton'

describe('Skeleton', () => {
  it('renders a span element', () => {
    const { container } = render(<Skeleton />)
    expect(container.querySelector('span')).toBeInTheDocument()
  })

  it('has aria-hidden="true"', () => {
    const { container } = render(<Skeleton />)
    expect(container.querySelector('span')).toHaveAttribute('aria-hidden', 'true')
  })

  it('applies animate-shimmer class', () => {
    const { container } = render(<Skeleton />)
    expect(container.querySelector('span')).toHaveClass('animate-shimmer')
  })

  it('applies default width 100% and height 1em', () => {
    const { container } = render(<Skeleton />)
    const span = container.querySelector('span') as HTMLElement
    expect(span.style.width).toBe('100%')
    expect(span.style.height).toBe('1em')
  })

  it('converts numeric width and height to px', () => {
    const { container } = render(<Skeleton width={120} height={24} />)
    const span = container.querySelector('span') as HTMLElement
    expect(span.style.width).toBe('120px')
    expect(span.style.height).toBe('24px')
  })

  it('accepts string width and height as-is', () => {
    const { container } = render(<Skeleton width="50%" height="2rem" />)
    const span = container.querySelector('span') as HTMLElement
    expect(span.style.width).toBe('50%')
    expect(span.style.height).toBe('2rem')
  })

  it('applies rounded-md by default', () => {
    const { container } = render(<Skeleton />)
    expect(container.querySelector('span')).toHaveClass('rounded-md')
  })

  it('applies rounded-full when rounded="full"', () => {
    const { container } = render(<Skeleton rounded="full" />)
    expect(container.querySelector('span')).toHaveClass('rounded-full')
  })

  it('applies rounded-none when rounded="none"', () => {
    const { container } = render(<Skeleton rounded="none" />)
    expect(container.querySelector('span')).toHaveClass('rounded-none')
  })

  it('merges custom className', () => {
    const { container } = render(<Skeleton className="custom-class" />)
    const span = container.querySelector('span')
    expect(span).toHaveClass('custom-class')
    expect(span).toHaveClass('animate-shimmer')
  })
})
