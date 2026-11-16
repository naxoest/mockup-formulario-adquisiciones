import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Loading } from './Loading'

describe('Loading', () => {
  describe('default (container variant)', () => {
    it('renders a status role element containing an svg', () => {
      render(<Loading />)
      const status = screen.getByRole('status')
      expect(status).toBeInTheDocument()
      expect(status.querySelector('svg')).toBeInTheDocument()
    })

    it('has default aria-label "Cargando"', () => {
      render(<Loading />)
      expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Cargando')
    })

    it('applies custom ariaLabel', () => {
      render(<Loading ariaLabel="Procesando" />)
      expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Procesando')
    })

    it('merges custom className', () => {
      render(<Loading className="bg-red-100" />)
      expect(screen.getByRole('status')).toHaveClass('bg-red-100')
    })
  })

  describe('inline variant', () => {
    it('renders the spinner directly as status (no wrapper)', () => {
      const { container } = render(<Loading variant="inline" />)
      const status = screen.getByRole('status')
      expect(status).toBe(container.querySelector('svg'))
    })

    it('applies aria-label on the spinner', () => {
      render(<Loading variant="inline" />)
      expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Cargando')
    })
  })

  describe('fullscreen variant', () => {
    it('applies min-h-screen container', () => {
      render(<Loading variant="fullscreen" />)
      expect(screen.getByRole('status')).toHaveClass('min-h-screen')
    })

    it('renders message when provided', () => {
      render(<Loading variant="fullscreen" message="Cargando datos" />)
      expect(screen.getByText('Cargando datos')).toBeInTheDocument()
    })
  })

  describe('logo variant', () => {
    it('applies min-h-screen container with logo', () => {
      render(<Loading variant="logo" />)
      const status = screen.getByRole('status')
      expect(status).toHaveClass('min-h-screen')
      expect(status.querySelector('svg')).toBeInTheDocument()
    })

    it('renders message when provided', () => {
      render(<Loading variant="logo" message="Iniciando" />)
      expect(screen.getByText('Iniciando')).toBeInTheDocument()
    })
  })
})
