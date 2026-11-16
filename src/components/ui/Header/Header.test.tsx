import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Header } from './Header'

describe('Header', () => {
  it('renders the toggle button with accessible label', () => {
    render(<Header onToggleSidebar={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Alternar barra lateral' })).toBeInTheDocument()
  })

  it('calls onToggleSidebar when the toggle button is clicked', async () => {
    const user = userEvent.setup()
    const onToggleSidebar = vi.fn()
    render(<Header onToggleSidebar={onToggleSidebar} />)
    await user.click(screen.getByRole('button', { name: 'Alternar barra lateral' }))
    expect(onToggleSidebar).toHaveBeenCalledTimes(1)
  })

  it('renders children when provided', () => {
    render(
      <Header onToggleSidebar={vi.fn()}>
        <span>Contenido extra</span>
      </Header>,
    )
    expect(screen.getByText('Contenido extra')).toBeInTheDocument()
  })

  it('does not render the children slot when no children are provided', () => {
    const { container } = render(<Header onToggleSidebar={vi.fn()} />)
    const slot = container.querySelector('.flex-1')
    expect(slot).not.toBeInTheDocument()
  })

  it('applies custom className when provided', () => {
    const { container } = render(<Header onToggleSidebar={vi.fn()} className="custom-header" />)
    const header = container.querySelector('header')
    expect(header).toHaveClass('custom-header')
  })

  it('has sticky positioning by default', () => {
    const { container } = render(<Header onToggleSidebar={vi.fn()} />)
    const header = container.querySelector('header')
    expect(header).toHaveClass('sticky')
    expect(header).toHaveClass('top-0')
  })
})
