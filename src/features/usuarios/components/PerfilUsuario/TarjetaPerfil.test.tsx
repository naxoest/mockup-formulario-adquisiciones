import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TarjetaPerfil } from './TarjetaPerfil'
import type { PortadaResuelta } from '@/features/usuarios/types/imagen.types'

const propiedades = {
  nombre: 'Ana Rojas Pérez',
  iniciales: 'AR',
  semilla: 12345678,
  roles: ['Administrador', 'Analista'],
  correo: 'ana.rojas@ejemplo.cl',
}

const portada: PortadaResuelta = {
  clave: 'volcan-osorno',
  nombre: 'Volcán Osorno',
  encuadre: 'object-[50%_20%]',
  src: 'https://ejemplo.cl/volcan-osorno-1200.webp',
  srcSet:
    'https://ejemplo.cl/volcan-osorno-1200.webp 1200w, https://ejemplo.cl/volcan-osorno-2400.webp 2400w',
  miniatura: 'https://ejemplo.cl/volcan-osorno-600.webp',
}

describe('TarjetaPerfil', () => {
  it('muestra el nombre como encabezado principal', () => {
    render(<TarjetaPerfil {...propiedades} />)

    expect(screen.getByRole('heading', { level: 1, name: 'Ana Rojas Pérez' })).toBeInTheDocument()
  })

  it('muestra las iniciales y los roles', () => {
    render(<TarjetaPerfil {...propiedades} />)

    expect(screen.getByText('AR')).toBeInTheDocument()
    expect(screen.getByText('Administrador')).toBeInTheDocument()
    expect(screen.getByText('Analista')).toBeInTheDocument()
  })

  it('indica cuando la persona no tiene roles', () => {
    render(<TarjetaPerfil {...propiedades} roles={[]} />)

    expect(screen.getByText('Sin roles')).toBeInTheDocument()
  })

  it('ofrece el correo como enlace de contacto', () => {
    render(<TarjetaPerfil {...propiedades} />)

    expect(screen.getByRole('link', { name: 'ana.rojas@ejemplo.cl' })).toHaveAttribute(
      'href',
      'mailto:ana.rojas@ejemplo.cl',
    )
  })

  it('omite el enlace cuando no hay correo', () => {
    render(<TarjetaPerfil {...propiedades} correo={null} />)

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('muestra la foto cuando la recibe', () => {
    const { container } = render(
      <TarjetaPerfil {...propiedades} foto="https://example.com/foto.jpg" />,
    )

    expect(container.querySelector('img')).toHaveAttribute('src', 'https://example.com/foto.jpg')
  })

  it('ofrece cambiar la foto solo cuando recibe la accion', async () => {
    const user = userEvent.setup()
    const onEditarFoto = vi.fn()
    const { rerender } = render(<TarjetaPerfil {...propiedades} />)

    expect(
      screen.queryByRole('button', { name: 'Cambiar la foto de perfil' }),
    ).not.toBeInTheDocument()

    rerender(<TarjetaPerfil {...propiedades} onEditarFoto={onEditarFoto} />)
    await user.click(screen.getByRole('button', { name: 'Cambiar la foto de perfil' }))

    expect(onEditarFoto).toHaveBeenCalledTimes(1)
  })

  it('muestra la portada con sus variantes y su encuadre', () => {
    const { container } = render(<TarjetaPerfil {...propiedades} portada={portada} />)
    const imagen = container.querySelector('img')

    expect(imagen).toHaveAttribute('src', portada.src)
    expect(imagen).toHaveAttribute('srcset', portada.srcSet)
    expect(imagen).toHaveClass('object-[50%_20%]')
  })

  it('ofrece cambiar la portada solo cuando recibe la accion', async () => {
    const user = userEvent.setup()
    const onEditarPortada = vi.fn()
    const { rerender } = render(<TarjetaPerfil {...propiedades} />)

    expect(screen.queryByRole('button', { name: 'Cambiar la portada' })).not.toBeInTheDocument()

    rerender(<TarjetaPerfil {...propiedades} onEditarPortada={onEditarPortada} />)
    await user.click(screen.getByRole('button', { name: 'Cambiar la portada' }))

    expect(onEditarPortada).toHaveBeenCalledTimes(1)
  })
})
