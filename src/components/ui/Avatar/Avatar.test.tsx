import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Avatar } from './Avatar'

const IMAGEN = 'https://example.com/a.jpg'

describe('Avatar', () => {
  it('muestra las iniciales en mayuscula', () => {
    const { container } = render(<Avatar initials="cf" seed={1} />)
    expect(container.textContent).toBe('CF')
  })

  it('recorta a dos caracteres', () => {
    const { container } = render(<Avatar initials="abcd" seed={1} />)
    expect(container.textContent).toBe('AB')
  })

  it('queda oculto a tecnologias de asistencia cuando no recibe etiqueta', () => {
    const { container } = render(<Avatar initials="CF" seed={1} />)
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('se expone como imagen cuando recibe etiqueta', () => {
    render(<Avatar initials="CF" seed={1} ariaLabel="Camila Fernández" />)
    expect(screen.getByRole('img', { name: 'Camila Fernández' })).toBeInTheDocument()
  })

  it('asigna el mismo tono a la misma semilla numerica', () => {
    const primero = render(<Avatar initials="CF" seed={12345678} />)
    const claseInicial = primero.container.firstElementChild?.className
    primero.unmount()

    const segundo = render(<Avatar initials="XX" seed={12345678} />)
    expect(segundo.container.firstElementChild?.className).toBe(claseInicial)
  })

  it('asigna el mismo tono a la misma semilla de texto', () => {
    const primero = render(<Avatar initials="CF" seed="camila" />)
    const claseInicial = primero.container.firstElementChild?.className
    primero.unmount()

    const segundo = render(<Avatar initials="CF" seed="camila" />)
    expect(segundo.container.firstElementChild?.className).toBe(claseInicial)
  })

  it('aplica el tamaño solicitado', () => {
    const { container } = render(<Avatar initials="CF" seed={1} size="lg" />)
    expect(container.firstElementChild?.className).toContain('size-11')
  })

  it('ofrece los tamaños del sidebar y del encabezado de perfil', () => {
    const { container, rerender } = render(<Avatar initials="CF" seed={1} size="xl" />)
    expect(container.firstElementChild?.className).toContain('size-14')

    rerender(<Avatar initials="CF" seed={1} size="2xl" />)
    expect(container.firstElementChild?.className).toContain('size-24')
  })

  it('no falla con una semilla numerica no finita', () => {
    const { container } = render(<Avatar initials="CF" seed={Number.NaN} />)
    expect(container.firstElementChild?.className).toContain('bg-')
  })

  it('muestra la imagen con su etiqueta cuando recibe src', () => {
    render(<Avatar initials="CF" seed={1} src={IMAGEN} ariaLabel="Camila Fernández" />)
    expect(screen.getByRole('img', { name: 'Camila Fernández' })).toHaveAttribute('src', IMAGEN)
  })

  it('trata la imagen como decorativa cuando no recibe etiqueta', () => {
    const { container } = render(<Avatar initials="CF" seed={1} src={IMAGEN} />)
    expect(container.querySelector('img')).toHaveAttribute('alt', '')
  })

  it('vuelve a las iniciales si la imagen no carga', () => {
    render(<Avatar initials="CF" seed={1} src={IMAGEN} ariaLabel="Camila Fernández" />)

    fireEvent.error(screen.getByRole('img', { name: 'Camila Fernández' }))

    expect(screen.getByRole('img', { name: 'Camila Fernández' })).toHaveTextContent('CF')
  })

  it('difiere la carga de la imagen cuando se le indica', () => {
    const { container } = render(<Avatar initials="CF" seed={1} src={IMAGEN} loading="lazy" />)
    expect(container.querySelector('img')).toHaveAttribute('loading', 'lazy')
  })

  it('deja la carga por defecto del navegador cuando no se le indica', () => {
    const { container } = render(<Avatar initials="CF" seed={1} src={IMAGEN} />)
    expect(container.querySelector('img')).not.toHaveAttribute('loading')
  })
})
