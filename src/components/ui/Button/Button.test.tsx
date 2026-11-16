import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { Button } from './Button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('has type="button" by default', () => {
    render(<Button>Click</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('respects custom type prop', () => {
    render(<Button type="submit">Submit</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })

  it('fires onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)
    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not fire onClick when disabled', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Click
      </Button>,
    )
    await user.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('does not fire onClick when loading', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <Button loading onClick={onClick}>
        Click
      </Button>,
    )
    await user.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('applies primary variant classes by default', () => {
    render(<Button>Click</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-primary-600')
  })

  it('applies secondary variant classes', () => {
    render(<Button variant="secondary">Click</Button>)
    expect(screen.getByRole('button')).toHaveClass('border-mercury-200')
  })

  it('applies ghost variant classes', () => {
    render(<Button variant="ghost">Click</Button>)
    expect(screen.getByRole('button')).toHaveClass('text-espresso-600')
  })

  it('applies danger variant classes', () => {
    render(<Button variant="danger">Click</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-scarlet-50')
  })

  it('applies md size classes by default', () => {
    render(<Button>Click</Button>)
    expect(screen.getByRole('button')).toHaveClass('px-5')
  })

  it('applies sm size classes', () => {
    render(<Button size="sm">Click</Button>)
    expect(screen.getByRole('button')).toHaveClass('px-3')
  })

  it('applies lg size classes', () => {
    render(<Button size="lg">Click</Button>)
    expect(screen.getByRole('button')).toHaveClass('px-8')
  })

  it('forwards ref to the button element', () => {
    const ref = createRef<HTMLButtonElement>()
    render(<Button ref={ref}>Click</Button>)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('propagates aria and data attributes', () => {
    render(
      <Button aria-label="Custom label" data-testid="custom-button">
        Click
      </Button>,
    )
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Custom label')
    expect(button).toHaveAttribute('data-testid', 'custom-button')
  })

  it('sets aria-busy to true when loading', () => {
    render(<Button loading>Click</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true')
  })

  it('sets aria-busy to false when not loading', () => {
    render(<Button>Click</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'false')
  })

  it('merges custom className with component classes', () => {
    render(<Button className="custom-class">Click</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
    expect(button).toHaveClass('bg-primary-600')
  })

  it('is disabled in the DOM when loading', () => {
    render(<Button loading>Click</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
